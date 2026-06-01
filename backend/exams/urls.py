from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LevelViewSet, SubjectViewSet, ChapterViewSet, QuestionViewSet, 
    submit_exam, toggle_bookmark, submit_feedback, UserExamHistoryView
)

router = DefaultRouter()
router.register(r'levels', LevelViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'chapters', ChapterViewSet)
router.register(r'questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
    path('submit-exam/', submit_exam, name='submit-exam'),
    
    # Phase 4 API Routes
    path('history/', UserExamHistoryView.as_view({'get': 'list'}), name='exam-history'),
    path('bookmarks/', toggle_bookmark, name='toggle-bookmark'),
    path('feedback/', submit_feedback, name='submit-feedback'),
]