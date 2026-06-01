import os
import json
import requests
from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect, render
from django.db import transaction
from django.urls import path
from django.template.response import TemplateResponse
# UPDATE: BoardPaper মডেলটি import করা হয়েছে
from .models import Level, Subject, Chapter, Question, Option, BoardPaper

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'level')
    list_filter = ('level',)
    search_fields = ('name',)

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subject', 'is_free', 'is_special_locked')
    list_filter = ('subject', 'is_free', 'is_special_locked')
    search_fields = ('name',)

# UPDATE: BoardPaper কে Admin প্যানেলে রেজিস্টার করা হলো
@admin.register(BoardPaper)
class BoardPaperAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subject', 'is_free', 'is_special_locked')
    list_filter = ('subject', 'is_free', 'is_special_locked')
    search_fields = ('name',)


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    max_num = 4

class UploadMCQForm(forms.Form):
    level = forms.ModelChoiceField(queryset=Level.objects.all(), required=False, label="Class/Level")
    subject = forms.ModelChoiceField(queryset=Subject.objects.all(), required=False, label="Subject")
    chapter = forms.ModelChoiceField(queryset=Chapter.objects.all(), required=True, label="Default Chapter (Fallback)")
    json_file = forms.FileField(required=True, label="Select JSON File")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'level' in self.data:
            try:
                level_id = int(self.data.get('level'))
                self.fields['subject'].queryset = Subject.objects.filter(level_id=level_id)
            except (ValueError, TypeError):
                pass
        
        if 'subject' in self.data:
            try:
                subject_id = int(self.data.get('subject'))
                self.fields['chapter'].queryset = Chapter.objects.filter(subject_id=subject_id)
            except (ValueError, TypeError):
                pass


class QuestionAdminForm(forms.ModelForm):
    upload_image = forms.ImageField(required=False, label="Upload Image (Auto-generates URL)")

    class Meta:
        model = Question
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)
        upload_image = self.cleaned_data.get('upload_image')

        if upload_image:
            api_key = os.environ.get('IMGBB_API_KEY')
            url = f"https://api.imgbb.com/1/upload?key={api_key}"
            
            upload_image.file.seek(0)
            response = requests.post(url, files={'image': upload_image.file})
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and 'url' in data['data']:
                    instance.image_url = data['data']['url']

        if commit:
            instance.save()
            self.save_m2m()
        return instance


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ('id', 'text_excerpt', 'chapter')
    list_display_links = ('id', 'text_excerpt')
    list_filter = ('chapter__subject__level', 'chapter__subject', 'chapter', 'boards')
    search_fields = ('text',)
    inlines = [OptionInline]
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-json/', self.admin_site.admin_view(self.upload_mcq_view), name='exams_question_upload_mcq')
        ]
        return custom_urls + urls

    def upload_mcq_view(self, request):
        if request.method == 'POST':
            form = UploadMCQForm(request.POST, request.FILES)
            if form.is_valid():
                default_chapter = form.cleaned_data['chapter']
                json_file = form.cleaned_data['json_file']
                try:
                    data = json.load(json_file)
                    if not isinstance(data, list):
                        raise ValueError("JSON must be a list of expected objects.")

                    success_count = 0
                    error_count = 0

                    with transaction.atomic():
                        for item in data:
                            # Null handling (যেকোনো ভ্যালু ফাঁকা থাকলে ক্র্যাশ করবে না)
                            text = item.get('text') or "No Question Text Provided"
                            image_url = item.get('image_url') or None
                            board_reference = item.get('board_reference') or None
                            explanation = item.get('explanation') or None
                            options = item.get('options') or []

                            # ১. Chapter Dynamic Check
                            chapter_name = item.get('chapter_name')
                            target_chapter = default_chapter
                            if chapter_name:
                                found_chapter = Chapter.objects.filter(name__iexact=chapter_name).first()
                                if found_chapter:
                                    target_chapter = found_chapter

                            # Question তৈরি করা
                            question = Question.objects.create(
                                chapter=target_chapter,
                                text=text,
                                image_url=image_url,
                                board_reference=board_reference,
                                explanation=explanation
                            )
                            
                            # Options তৈরি করা
                            for opt in options:
                                Option.objects.create(
                                    question=question,
                                    text=opt.get('text') or 'Empty Option',
                                    is_correct=bool(opt.get('is_correct', False))
                                )
                            
                            # ২. Board (ManyToMany) Logic
                            board_names = item.get('boards')
                            if board_names and isinstance(board_names, list):
                                found_boards = BoardPaper.objects.filter(name__in=board_names)
                                if found_boards.exists():
                                    question.boards.add(*found_boards)
                            
                            success_count += 1
                        
                    self.message_user(request, f"Successfully imported {success_count} questions. Errors: {error_count}", level=messages.SUCCESS)
                    return redirect('..')
                except Exception as e:
                    self.message_user(request, f"Error processing file: {str(e)}", level=messages.ERROR)
        else:
            form = UploadMCQForm()

        context = {
            **self.admin_site.each_context(request),
            'form': form,
            'opts': self.model._meta,
            'title': 'Upload MCQs via JSON'
        }
        return TemplateResponse(request, "admin/upload_mcq.html", context)

    def text_excerpt(self, obj):
        return obj.text[:75] + '...' if len(obj.text) > 75 else obj.text
    text_excerpt.short_description = 'Question Text'

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'is_correct', 'question')
    list_filter = ('is_correct', 'question__chapter')
    search_fields = ('text', 'question__text')