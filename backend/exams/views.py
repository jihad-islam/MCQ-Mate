from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
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
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.all()
        # Read parameters matching frontend nomenclature or fallback to old ones
        chapter_id = self.request.query_params.get('chapterId') or self.request.query_params.get('chapter')
        limit = self.request.query_params.get('mcqCount') or self.request.query_params.get('limit')
        
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        if limit:
            try:
                limit_int = int(limit)
                pks = list(queryset.values_list('pk', flat=True))
                if len(pks) > limit_int:
                    selected_pks = random.sample(pks, limit_int)
                    # Use random.sample to avoid slow database-level order_by('?')
                    queryset = queryset.filter(pk__in=selected_pks)
            except ValueError:
                pass
                
        return queryset


@api_view(['POST'])
def submit_exam(request):
    """
    SECURITY: Backend scoring endpoint.
    Accepts student answers and calculates the score server-side.
    
    Expected payload: {
        "answers": [
            {"question_id": 1, "selected_option_id": 4},
            {"question_id": 2, "selected_option_id": 5},
            ...
        ]
    }
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
                # Find the correct option for this question
                correct_option = question.options.filter(is_correct=True).first()
                correct_option_id = correct_option.id if correct_option else None
                
                # Check if the user selected the correct option
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
                # Invalid option or question, count as wrong
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

