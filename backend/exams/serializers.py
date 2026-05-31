from rest_framework import serializers
from .models import Level, Subject, Chapter, Question, Option

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']  # SECURITY: Removed 'is_correct' to prevent frontend cheating


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'image_url', 'board_reference', 'chapter', 'options']

class ChapterSerializer(serializers.ModelSerializer):
    total_mcqs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'name', 'subject', 'total_mcqs']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'level']

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'name']
