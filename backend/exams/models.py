from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Level(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=255)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='subjects')

    def __str__(self):
        return f"{self.name} - {self.level.name}"

class Chapter(models.Model):
    name = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='chapters')
    is_free = models.BooleanField(default=False)
    is_special_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class BoardPaper(models.Model):
    name = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='board_papers')
    is_free = models.BooleanField(default=False)
    is_special_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Question(models.Model):
    text = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    board_reference = models.CharField(max_length=255, blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='questions')
    boards = models.ManyToManyField(BoardPaper, related_name='questions', blank=True)

    def __str__(self):
        return self.text[:50]

class Option(models.Model):
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')

    def __str__(self):
        return f"{self.text} {'(Correct)' if self.is_correct else ''}"


# ==========================================
# PHASE 4: TRACKING & FEEDBACK MODELS
# ==========================================

class ExamHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_histories')
    score = models.FloatField()
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    wrong_answers = models.IntegerField()
    # Lightweight storage for tracking mistakes without overloading DB rows
    wrong_question_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.score}%"

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question') # একজন ইউজার একটি প্রশ্ন একবারই বুকমার্ক করতে পারবে

    def __str__(self):
        return f"Bookmark by {self.user.first_name}"

class QuestionFeedback(models.Model):
    ISSUE_CHOICES = (
        ('wrong_option', 'Wrong Options'),
        ('typo', 'Typo or Spelling Error'),
        ('unclear', 'Question is Unclear'),
        ('other', 'Other'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='feedbacks')
    issue_type = models.CharField(max_length=20, choices=ISSUE_CHOICES)
    message = models.TextField(blank=True, null=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type} - {self.question.id}"