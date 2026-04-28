import json
from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect, render
from django.db import transaction
from django.urls import path
from django.template.response import TemplateResponse
from .models import Level, Subject, Chapter, Question, Option

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
    list_display = ('id', 'name', 'subject')
    list_filter = ('subject', 'subject__level')
    search_fields = ('name',)

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    max_num = 4

class UploadMCQForm(forms.Form):
    level = forms.ModelChoiceField(queryset=Level.objects.all(), required=False, label="Class/Level")
    subject = forms.ModelChoiceField(queryset=Subject.objects.all(), required=False, label="Subject")
    chapter = forms.ModelChoiceField(queryset=Chapter.objects.all(), required=True, label="Chapter")
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


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text_excerpt', 'chapter')
    list_filter = ('chapter__subject__level', 'chapter__subject', 'chapter')
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
                chapter = form.cleaned_data['chapter']
                json_file = form.cleaned_data['json_file']
                try:
                    data = json.load(json_file)
                    if not isinstance(data, list):
                        raise ValueError("JSON must be a list of expected objects.")

                    success_count = 0
                    error_count = 0

                    with transaction.atomic():
                        for item in data:
                            text = item.get('text')
                            explanation = item.get('explanation')
                            options = item.get('options')

                            if not all([text, options]):
                                error_count += 1
                                continue

                            question = Question.objects.create(
                                chapter=chapter,
                                text=text,
                                explanation=explanation
                            )
                            for opt in options:
                                Option.objects.create(
                                    question=question,
                                    text=opt.get('text', ''),
                                    is_correct=opt.get('is_correct', False)
                                )
                            success_count += 1
                        
                    self.message_user(request, f"Successfully imported {success_count} questions into {chapter.name}. Skipped/Errors: {error_count}", level=messages.SUCCESS)
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
