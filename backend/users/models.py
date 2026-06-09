# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    bkash_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=255, help_text="e.g., SSC Premium Access")
    level = models.ForeignKey('exams.Level', on_delete=models.CASCADE, related_name='plans')
    price = models.DecimalField(max_digits=8, decimal_places=2, help_text="Original Price")
    discounted_price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, help_text="Offer Price (Keep blank if no discount)")
    valid_until = models.DateTimeField(help_text="Course expiry date", null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide this plan from the frontend")

    def __str__(self):
        return f"{self.name} - ৳{self.price}"

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='subscribers', null=True)
    trx_id = models.CharField(max_length=100, blank=True, null=True)
    sender_number = models.CharField(max_length=15, blank=True, null=True, help_text="The number user sent money from")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    # UPDATE: expiry_date field completely removed!
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} -> {self.plan.name if self.plan else 'Unknown Plan'} ({self.status})"

class CheckoutSettings(models.Model):
    bkash_number = models.CharField(max_length=15, default="017XX-XXXXXX", help_text="Number to show for payment")
    page_title = models.CharField(max_length=255, default="Unlock your full potential.")
    page_subtitle = models.TextField(default="Join thousands of students and get unlimited access.")
    benefits = models.JSONField(default=list, help_text='Enter benefits as JSON list. e.g. ["Benefit 1", "Benefit 2"]')
    
    class Meta:
        verbose_name = "Checkout Page Setting"
        verbose_name_plural = "Checkout Page Settings"

    def __str__(self):
        return "Checkout Page Dynamic Settings"