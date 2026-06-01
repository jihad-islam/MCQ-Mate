# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    bkash_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)

    # Email কে primary login identifier হিসেবে ব্যবহার করার জন্য
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
    )
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription')
    trx_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    expiry_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.status}"