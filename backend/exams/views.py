# backend/exams/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Level, Subject, Chapter, Question, Option, BoardPaper
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

    def list(self, request, *args, **kwargs):
        # Admin Lock ছাড়া সব Chapter এবং BoardPaper একসাথে fetch করা হচ্ছে
        chapters = Chapter.objects.filter(is_special_locked=False).annotate(total_mcqs=Count('questions'))
        boards = BoardPaper.objects.filter(is_special_locked=False).annotate(total_mcqs=Count('questions'))

        data = []
        for c in chapters:
            data.append({
                'id': c.id,
                'name': c.name,
                'subject': c.subject_id,
                'total_mcqs': c.total_mcqs,
                'is_free': c.is_free,
                'is_board': False
            })
        
        for b in boards:
            data.append({
                'id': b.id + 100000,  # ID Clash এড়ানোর জন্য Offset Trick
                'name': f"{b.name} (Board Question)", 
                'subject': b.subject_id,
                'total_mcqs': b.total_mcqs,
                'is_free': b.is_free,
                'is_board': True
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
                
                # 100000 এর ওপরের ID গুলো BoardPaper, বাকিগুলো Chapter
                chapter_ids = [cid for cid in raw_ids if cid < 100000]
                board_ids = [cid - 100000 for cid in raw_ids if cid >= 100000]
                
                if not chapter_ids and not board_ids:
                    return queryset.none()
                
                # সবগুলো সোর্স (Chapter + Board) থেকে Question এর ID বের করা
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
def submit_exam(request):
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