from rest_framework import serializers
from .models import Level, Subject, Chapter, Question, Option, BoardPaper, ExamHistory, Bookmark, QuestionFeedback

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text'] 

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    chapter_name = serializers.CharField(source='chapter.name', read_only=True) 

    class Meta:
        model = Question
        fields = ['id', 'text', 'image_url', 'board_reference', 'chapter', 'chapter_name', 'options']

class ChapterSerializer(serializers.ModelSerializer):
    total_mcqs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'name', 'subject', 'total_mcqs', 'is_free']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'level']

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'name']

# ==========================================
# PHASE 4: TRACKING & FEEDBACK SERIALIZERS
# ==========================================

class ExamHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamHistory
        fields = ['id', 'score', 'total_questions', 'correct_answers', 'wrong_answers', 'wrong_question_ids', 'created_at']

class BookmarkOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class BookmarkQuestionSerializer(serializers.ModelSerializer):
    options = BookmarkOptionSerializer(many=True, read_only=True)
    chapter_name = serializers.CharField(source='chapter.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'image_url', 'board_reference', 'chapter', 'chapter_name', 'explanation', 'options']

class BookmarkSerializer(serializers.ModelSerializer):
    question = BookmarkQuestionSerializer(read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'question', 'created_at']

class QuestionFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionFeedback
        fields = ['question', 'issue_type', 'message']