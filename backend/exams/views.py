# backend/exams/views.py (FULL CODE)

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, Sum, Case, When
from .models import Level, Subject, Chapter, Question, Option, BoardPaper, ExamHistory, Bookmark, QuestionFeedback
from .serializers import LevelSerializer, SubjectSerializer, ChapterSerializer, QuestionSerializer, ExamHistorySerializer, BookmarkSerializer, QuestionFeedbackSerializer
import random

class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Level.objects.all().order_by('id')
    serializer_class = LevelSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all().order_by('id')
    serializer_class = SubjectSerializer

class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def list(self, request, *args, **kwargs):
        active_levels = []
        if request.user and request.user.is_authenticated:
            try:
                active_levels = list(request.user.subscriptions.filter(
                    status='active', 
                    plan__isnull=False
                ).values_list('plan__level_id', flat=True))
            except Exception:
                active_levels = []

        # UPDATE: Explicit order_by('id') added to ensure serial display
        chapters = Chapter.objects.filter(is_special_locked=False).select_related('subject').annotate(total_mcqs=Count('questions')).order_by('id')
        boards = BoardPaper.objects.filter(is_special_locked=False).select_related('subject').annotate(total_mcqs=Count('questions')).order_by('id')

        data = []
        for c in chapters:
            is_locked = not c.is_free and c.subject_id and (c.subject.level_id not in active_levels)
            data.append({
                'id': c.id, 'name': c.name, 'subject': c.subject_id,
                'total_mcqs': c.total_mcqs, 'is_free': c.is_free, 
                'is_board': False, 'is_locked': is_locked
            })
            
        for b in boards:
            is_locked = not b.is_free and b.subject_id and (b.subject.level_id not in active_levels)
            data.append({
                'id': b.id + 100000, 'name': f"{b.name} (Board Question)", 
                'subject': b.subject_id, 'total_mcqs': b.total_mcqs,
                'is_free': b.is_free, 'is_board': True, 'is_locked': is_locked
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

                active_levels = []
                if self.request.user and self.request.user.is_authenticated:
                    try:
                        active_levels = list(self.request.user.subscriptions.filter(
                            status='active', 
                            plan__isnull=False
                        ).values_list('plan__level_id', flat=True))
                    except Exception:
                        pass

                valid_chapter_ids = []
                valid_board_ids = []

                if chapter_ids:
                    chapters = Chapter.objects.filter(id__in=chapter_ids).select_related('subject')
                    for c in chapters:
                        if c.is_free or (c.subject_id and c.subject.level_id in active_levels):
                            valid_chapter_ids.append(c.id)

                if board_ids:
                    boards = BoardPaper.objects.filter(id__in=board_ids).select_related('subject')
                    for b in boards:
                        if b.is_free or (b.subject_id and b.subject.level_id in active_levels):
                            valid_board_ids.append(b.id)

                if not valid_chapter_ids and not valid_board_ids:
                    return queryset.none()
                
                q_query = Question.objects.none()
                if valid_chapter_ids:
                    q_query = q_query | Question.objects.filter(chapter_id__in=valid_chapter_ids)
                if valid_board_ids:
                    q_query = q_query | Question.objects.filter(boards__id__in=valid_board_ids)
                    
                questions = list(q_query.distinct())
                
                grouped = {}
                for q in questions:
                    gid = q.group_id if q.group_id else f"single_{q.id}"
                    if gid not in grouped:
                        grouped[gid] = []
                    grouped[gid].append(q)
                    
                for gid in grouped:
                    grouped[gid].sort(key=lambda x: x.id)
                    
                groups = list(grouped.values())
                random.shuffle(groups)
                
                ordered_pks = []
                limit = int(limit_str) if limit_str else None
                
                for g in groups:
                    if limit and len(ordered_pks) >= limit:
                        break
                    ordered_pks.extend([q.id for q in g])
                    
                if ordered_pks:
                    preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(ordered_pks)])
                    return Question.objects.filter(pk__in=ordered_pks).order_by(preserved_order)
                else:
                    return Question.objects.none()
                    
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
        wrong_question_ids = []
        
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

class UserExamHistoryView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        histories = ExamHistory.objects.filter(user=request.user).order_by('-created_at')[:10]
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