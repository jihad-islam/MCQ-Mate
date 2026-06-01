from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, Sum
from .models import Level, Subject, Chapter, Question, Option, BoardPaper, ExamHistory, Bookmark, QuestionFeedback
from .serializers import LevelSerializer, SubjectSerializer, ChapterSerializer, QuestionSerializer, ExamHistorySerializer, BookmarkSerializer, QuestionFeedbackSerializer
import random

class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def list(self, request, *args, **kwargs):
        chapters = Chapter.objects.filter(is_special_locked=False).annotate(total_mcqs=Count('questions'))
        boards = BoardPaper.objects.filter(is_special_locked=False).annotate(total_mcqs=Count('questions'))

        data = []
        for c in chapters:
            data.append({
                'id': c.id, 'name': c.name, 'subject': c.subject_id,
                'total_mcqs': c.total_mcqs, 'is_free': c.is_free, 'is_board': False
            })
        for b in boards:
            data.append({
                'id': b.id + 100000, 'name': f"{b.name} (Board Question)", 
                'subject': b.subject_id, 'total_mcqs': b.total_mcqs,
                'is_free': b.is_free, 'is_board': True
            })
        return Response(data)

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.all()
        chapter_ids_str = self.request.query_params.get('chapterIds') or self.request.query_params.get('chapterId')
        limit_str = self.request.query_params.get('mcqCount') or self.request.query_params.get('limit')
        
        if chapter_ids_str:
            try:
                raw_ids = [int(cid.strip()) for cid in chapter_ids_str.split(',') if cid.strip().isdigit()]
                chapter_ids = [cid for cid in raw_ids if cid < 100000]
                board_ids = [cid - 100000 for cid in raw_ids if cid >= 100000]
                
                if not chapter_ids and not board_ids:
                    return queryset.none()
                
                sources = []
                for cid in chapter_ids:
                    sources.append(list(Question.objects.filter(chapter_id=cid).values_list('pk', flat=True)))
                for bid in board_ids:
                    sources.append(list(Question.objects.filter(boards__id=bid).values_list('pk', flat=True)))
                    
                selected_pks = set()
                remaining_pks_pool = set()
                
                if limit_str:
                    limit = int(limit_str)
                    num_sources = len(sources)
                    base_count = limit // num_sources if num_sources > 0 else 0
                    
                    for source_pks in sources:
                        available = list(set(source_pks) - selected_pks)
                        if len(available) <= base_count:
                            selected_pks.update(available)
                        else:
                            chosen = random.sample(available, base_count)
                            selected_pks.update(chosen)
                            remaining_pks_pool.update(set(available) - set(chosen))
                            
                    deficit = limit - len(selected_pks)
                    if deficit > 0 and remaining_pks_pool:
                        pool = list(remaining_pks_pool - selected_pks)
                        if len(pool) <= deficit:
                            selected_pks.update(pool)
                        else:
                            selected_pks.update(random.sample(pool, deficit))
                            
                    queryset = Question.objects.filter(pk__in=selected_pks).distinct().order_by('?')
                else:
                    all_pks = [pk for source in sources for pk in source]
                    queryset = Question.objects.filter(pk__in=all_pks).distinct().order_by('?')
            except ValueError:
                pass
        return queryset

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_exam(request):
    try:
        served_question_ids = request.data.get('served_question_ids', [])
        answers = request.data.get('answers', [])
        
        if not served_question_ids:
            return Response({'error': 'No questions provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        answers_dict = {ans['question_id']: ans.get('selected_option_id') for ans in answers if ans.get('question_id')}
        
        correct_count = 0
        wrong_count = 0
        breakdown = []
        wrong_question_ids = []  # Tracking for history
        
        for q_id in served_question_ids:
            selected_option_id = answers_dict.get(q_id)
            
            try:
                question = Question.objects.get(id=q_id)
                correct_option = question.options.filter(is_correct=True).first()
                correct_option_id = correct_option.id if correct_option else None
                
                if selected_option_id:
                    option = Option.objects.get(id=selected_option_id, question_id=q_id)
                    if option.is_correct:
                        correct_count += 1
                    else:
                        wrong_count += 1
                        wrong_question_ids.append(q_id)
                else:
                    wrong_count += 1
                    wrong_question_ids.append(q_id)
                    
                breakdown.append({
                    'question_id': q_id,
                    'correct_option_id': correct_option_id,
                    'explanation': question.explanation,
                })
            except (Option.DoesNotExist, Question.DoesNotExist):
                wrong_count += 1
                wrong_question_ids.append(q_id)
        
        total_questions = len(served_question_ids)
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0

        # UPDATE: Save History only if user is logged in
        if request.user and request.user.is_authenticated:
            ExamHistory.objects.create(
                user=request.user,
                score=round(score, 2),
                total_questions=total_questions,
                correct_answers=correct_count,
                wrong_answers=wrong_count,
                wrong_question_ids=wrong_question_ids
            )
        
        return Response({
            'score': round(score, 2),
            'correct_answers': correct_count,
            'wrong_answers': wrong_count,
            'total_questions': total_questions,
            'breakdown': breakdown,
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# PHASE 4: TRACKING & FEEDBACK API VIEWS
# ==========================================

class UserExamHistoryView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        histories = ExamHistory.objects.filter(user=request.user).order_by('-created_at')[:10] # Last 10 exams
        serializer = ExamHistorySerializer(histories, many=True)
        
        stats = ExamHistory.objects.filter(user=request.user).aggregate(
            avg_score=Avg('score'),
            total_exams=Count('id'),
            total_questions=Sum('total_questions')
        )
        
        return Response({
            'stats': stats,
            'history': serializer.data
        })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request):
    if request.method == 'GET':
        bookmarks = Bookmark.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        question_id = request.data.get('question_id')
        if not question_id:
            return Response({"error": "question_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, question_id=question_id)
        if not created:
            bookmark.delete()
            return Response({"message": "Bookmark removed", "is_bookmarked": False})
        return Response({"message": "Bookmark added", "is_bookmarked": True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback(request):
    serializer = QuestionFeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({"message": "Feedback submitted successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)