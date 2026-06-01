# backend/exams/serializers.py
from rest_framework import serializers
from .models import Level, Subject, Chapter, Question, Option, BoardPaper

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']  # SECURITY: Removed 'is_correct' to prevent frontend cheating

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    chapter_name = serializers.CharField(source='chapter.name', read_only=True) # UI-তে চ্যাপ্টার টগল করার জন্য

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