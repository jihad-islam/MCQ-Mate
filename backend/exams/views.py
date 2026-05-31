from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import Level, Subject, Chapter, Question, Option
from .serializers import LevelSerializer, SubjectSerializer, ChapterSerializer, QuestionSerializer
import random

class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chapter.objects.annotate(total_mcqs=Count('questions'))
    serializer_class = ChapterSerializer


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.all()
        
        # Support both new 'chapterIds' (for multi-select) and old parameters for fallback
        chapter_ids_str = self.request.query_params.get('chapterIds') or self.request.query_params.get('chapterId') or self.request.query_params.get('chapter')
        limit_str = self.request.query_params.get('mcqCount') or self.request.query_params.get('limit')
        
        if chapter_ids_str:
            try:
                # Convert comma-separated string "4,5,6" to list of integers [4, 5, 6]
                chapter_ids = [int(cid.strip()) for cid in chapter_ids_str.split(',') if cid.strip().isdigit()]
                
                if not chapter_ids:
                    return queryset.none()
                    
                if limit_str:
                    limit = int(limit_str)
                    num_chapters = len(chapter_ids)
                    
                    base_count = limit // num_chapters
                    
                    selected_pks = []
                    remaining_pks_pool = []
                    
                    # Step 1: Gather proportional base amount from each chapter
                    for cid in chapter_ids:
                        chapter_pks = list(Question.objects.filter(chapter_id=cid).values_list('pk', flat=True))
                        
                        if len(chapter_pks) <= base_count:
                            # If chapter has fewer or exactly equal questions to base_count, take all of them
                            selected_pks.extend(chapter_pks)
                        else:
                            # Take exactly base_count randomly from this chapter
                            chosen = random.sample(chapter_pks, base_count)
                            selected_pks.extend(chosen)
                            # Add the unselected questions to a pool for later deficit handling
                            remaining_pks_pool.extend(list(set(chapter_pks) - set(chosen)))
                    
                    # Step 2: Fulfill deficit (caused by remainders like 70/3 or chapters with insufficient questions)
                    deficit = limit - len(selected_pks)
                    if deficit > 0 and remaining_pks_pool:
                        if len(remaining_pks_pool) <= deficit:
                            selected_pks.extend(remaining_pks_pool)
                        else:
                            selected_pks.extend(random.sample(remaining_pks_pool, deficit))
                            
                    # Final Step: Filter by selected PKs and shuffle so chapters are completely mixed in the UI
                    queryset = Question.objects.filter(pk__in=selected_pks).order_by('?')
                else:
                    # If no limit provided, just return all questions from selected chapters in random order
                    queryset = queryset.filter(chapter_id__in=chapter_ids).order_by('?')
                    
            except ValueError:
                pass
                
        return queryset


@api_view(['POST'])
def submit_exam(request):
    """
    SECURITY: Backend scoring endpoint.
    Accepts student answers and calculates the score server-side.
    """
    try:
        served_question_ids = request.data.get('served_question_ids', [])
        answers = request.data.get('answers', [])
        
        if not served_question_ids and not answers:
            return Response(
                {'error': 'No answers or question ids provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        answers_dict = {ans['question_id']: ans.get('selected_option_id') for ans in answers if ans.get('question_id')}
        
        correct_count = 0
        wrong_count = 0
        breakdown = []
        
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
                else:
                    wrong_count += 1
                    
                breakdown.append({
                    'question_id': q_id,
                    'correct_option_id': correct_option_id,
                    'explanation': question.explanation,
                })
            except (Option.DoesNotExist, Question.DoesNotExist):
                wrong_count += 1
        
        total_questions = len(served_question_ids)
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        return Response({
            'score': round(score, 2),
            'correct_answers': correct_count,
            'wrong_answers': wrong_count,
            'total_questions': total_questions,
            'breakdown': breakdown,
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )