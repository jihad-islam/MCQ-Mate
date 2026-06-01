# backend/exams/models.py
from django.db import models

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
    
    # Freemium এবং Special Lock লজিক
    is_free = models.BooleanField(default=False)
    is_special_locked = models.BooleanField(default=False)  # Admin চাইলে পুরোপুরি হাইড করে রাখতে পারবে

    def __str__(self):
        return self.name

# নতুন মডেল: বোর্ড প্রশ্নগুলোকে সুন্দরভাবে অর্গানাইজ করার জন্য
class BoardPaper(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Physics Dhaka Board 2025"
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='board_papers')
    
    is_free = models.BooleanField(default=False)
    is_special_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Question(models.Model):
    text = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    
    # এই ফিল্ডটি ফ্রন্টএন্ডে নরমাল এক্সামের সময় ট্যাগ হিসেবে দেখাবে (e.g., "DB 25, DU 19-20")
    board_reference = models.CharField(max_length=255, blank=True, null=True)
    
    explanation = models.TextField(blank=True, null=True)
    
    # একটি প্রশ্ন কোন চ্যাপ্টারের
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='questions')
    
    # একটি প্রশ্ন কোন কোন বোর্ডের (একাধিক বোর্ড হতে পারে, তাই ManyToMany)
    boards = models.ManyToManyField(BoardPaper, related_name='questions', blank=True)

    def __str__(self):
        return self.text[:50]

class Option(models.Model):
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')

    def __str__(self):
        return f"{self.text} {'(Correct)' if self.is_correct else ''}"