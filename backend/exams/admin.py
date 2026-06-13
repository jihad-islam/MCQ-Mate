import json
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.urls import path
from django.template.response import TemplateResponse
from django.http import JsonResponse

# Models Import
from .models import Level, Subject, Chapter, Question, Option, BoardPaper
# Forms Import
from .forms import UploadMCQForm, QuestionAdminForm
# Services Import
from .services import process_mcq_json

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
    list_display_links = ('id', 'name')
    list_editable = ('is_free', 'is_special_locked')
    list_filter = ('subject', 'is_free', 'is_special_locked')
    search_fields = ('name',)

@admin.register(BoardPaper)
class BoardPaperAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subject', 'is_free', 'is_special_locked')
    list_display_links = ('id', 'name')
    list_editable = ('is_free', 'is_special_locked')
    list_filter = ('subject', 'is_free', 'is_special_locked')
    search_fields = ('name',)


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    max_num = 4


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ('id', 'text_excerpt', 'chapter', 'group_id')
    list_display_links = ('id', 'text_excerpt')
    list_filter = ('chapter__subject__level', 'chapter__subject', 'chapter', 'boards')
    search_fields = ('text', 'group_id')
    
    autocomplete_fields = ['chapter', 'boards']
    
    inlines = [OptionInline]
    
    # ==========================================
    # UPDATE: CKEditor Configuration Completely Removed!
    # ==========================================
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-json/', self.admin_site.admin_view(self.upload_mcq_view), name='exams_question_upload_mcq'),
            path('ajax/load-options/', self.admin_site.admin_view(self.load_options_view), name='exams_question_ajax_load_options')
        ]
        return custom_urls + urls

    def load_options_view(self, request):
        """AJAX view to load subjects, chapters, and boards dynamically."""
        level_id = request.GET.get('level')
        subject_id = request.GET.get('subject')
        
        if level_id:
            subjects = list(Subject.objects.filter(level_id=level_id).values('id', 'name'))
            return JsonResponse({'subjects': subjects})
        
        if subject_id:
            chapters = list(Chapter.objects.filter(subject_id=subject_id).values('id', 'name'))
            boards = list(BoardPaper.objects.filter(subject_id=subject_id).values('id', 'name'))
            return JsonResponse({'chapters': chapters, 'boards': boards})
            
        return JsonResponse({'error': 'Invalid request'}, status=400)

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

                    success_count, merged_count = process_mcq_json(data, subject, default_chapter, form_board)
                        
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
    
    autocomplete_fields = ['question']