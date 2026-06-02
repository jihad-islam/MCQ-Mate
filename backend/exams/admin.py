import json
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.db import transaction
from django.urls import path
from django.template.response import TemplateResponse

# Models Import
from .models import Level, Subject, Chapter, Question, Option, BoardPaper
# Forms Import (যেটা আমরা একটু আগে তৈরি করেছি)
from .forms import UploadMCQForm, QuestionAdminForm

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

@admin.register(BoardPaper)
class BoardPaperAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subject', 'is_free', 'is_special_locked')
    list_filter = ('subject', 'is_free', 'is_special_locked')
    search_fields = ('name',)


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    max_num = 4


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
                default_chapter = form.cleaned_data.get('chapter')
                form_board = form.cleaned_data.get('board')
                subject = form.cleaned_data.get('subject')
                json_file = form.cleaned_data['json_file']
                
                try:
                    data = json.load(json_file)
                    if not isinstance(data, list):
                        raise ValueError("JSON must be a list of expected objects.")

                    success_count = 0
                    merged_count = 0

                    with transaction.atomic():
                        for item in data:
                            raw_text = item.get('text') or "No Question Text Provided"
                            clean_text = raw_text.strip()
                            
                            image_url = item.get('image_url') or None
                            board_reference = item.get('board_reference') or None
                            explanation = item.get('explanation') or None
                            options = item.get('options') or []

                            # ১. Chapter Dynamic Check & Auto-Creation
                            chapter_name = item.get('chapter_name')
                            target_chapter = default_chapter

                            if chapter_name:
                                if subject:
                                    # যদি ফর্মে Subject সিলেক্ট করা থাকে, তবে ওই Subject-এর আন্ডারে চ্যাপ্টার খুঁজবে বা বানাবে
                                    found_chapter, _ = Chapter.objects.get_or_create(name=chapter_name, subject=subject)
                                    target_chapter = found_chapter
                                else:
                                    # Subject না থাকলে ডাটাবেজে গ্লোবালি খুঁজবে
                                    found_chapter = Chapter.objects.filter(name__iexact=chapter_name).first()
                                    if found_chapter:
                                        target_chapter = found_chapter
                            
                            # ২. Board Logic (Form Selection + JSON Data)
                            boards_to_add = set()
                            
                            # ফর্ম থেকে সিলেক্ট করা বোর্ড অ্যাড করা
                            if form_board:
                                boards_to_add.add(form_board)
                            
                            # JSON ফাইলের ভেতর থাকা বোর্ড অ্যাড করা
                            json_boards = item.get('boards')
                            if json_boards and isinstance(json_boards, list):
                                found_boards = BoardPaper.objects.filter(name__in=json_boards)
                                boards_to_add.update(found_boards)

                            # ৩. Auto-Merge (Deduplication) Logic
                            existing_question = Question.objects.filter(text__iexact=clean_text).first()
                            
                            if existing_question:
                                # প্রশ্নটি আগে থেকেই আছে, তাই Merge করবো
                                if boards_to_add:
                                    existing_question.boards.add(*boards_to_add)
                                
                                # যদি আগের প্রশ্নে চ্যাপ্টার না থাকে, কিন্তু এখন পাওয়া যায়, তবে আপডেট করে দেব
                                if target_chapter and not existing_question.chapter:
                                    existing_question.chapter = target_chapter
                                    existing_question.save()
                                
                                merged_count += 1
                            else:
                                # প্রশ্নটি নতুন, তাই ক্রিয়েট করবো
                                question = Question.objects.create(
                                    chapter=target_chapter,
                                    text=clean_text,
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
                                
                                # ফাইনালি নতুন প্রশ্নকে বোর্ডের সাথে লিঙ্ক করা
                                if boards_to_add:
                                    question.boards.add(*boards_to_add)
                                
                                success_count += 1
                        
                    self.message_user(
                        request, 
                        f"Success! Uploaded {success_count} new questions. Merged {merged_count} existing questions.", 
                        level=messages.SUCCESS
                    )
                    return redirect('..')
                except Exception as e:
                    self.message_user(request, f"Error processing JSON: {str(e)}", level=messages.ERROR)
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