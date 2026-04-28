from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LevelViewSet, SubjectViewSet, ChapterViewSet, QuestionViewSet, submit_exam

router = DefaultRouter()
router.register(r'levels', LevelViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'chapters', ChapterViewSet)
router.register(r'questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
    path('submit-exam/', submit_exam, name='submit-exam'),
]
