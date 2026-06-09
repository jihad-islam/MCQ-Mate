# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from django.db import models
from django.forms import DateTimeInput
from .models import CustomUser, Subscription, SubscriptionPlan, CheckoutSettings

class SubscriptionInline(admin.TabularInline):
    model = Subscription
    extra = 1  
    # UPDATE: Removed expiry_date
    fields = ('plan', 'status', 'trx_id')
    autocomplete_fields = ['plan']

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'bkash_number', 'is_staff', 'is_active')
    search_fields = ('email', 'bkash_number', 'first_name')
    ordering = ('email',)
    inlines = [SubscriptionInline]

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'price', 'discounted_price', 'get_remaining_days', 'is_active')
    list_filter = ('level', 'is_active')
    search_fields = ('name',)
    list_editable = ('is_active', 'price', 'discounted_price')

    formfield_overrides = {
        models.DateTimeField: {'widget': DateTimeInput(attrs={'type': 'datetime-local', 'class': 'vTextField'})},
    }

    def get_remaining_days(self, obj):
        if obj.valid_until:
            delta = obj.valid_until.date() - timezone.now().date()
            if delta.days > 0:
                return f"{delta.days} days left"
            elif delta.days == 0:
                return "Expires today"
            else:
                return "Expired"
        return "No expiry date"
    
    get_remaining_days.short_description = 'Remaining Time'

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    # UPDATE: Removed expiry_date
    list_display = ('user', 'plan', 'status', 'trx_id', 'sender_number', 'created_at')
    list_filter = ('status', 'plan__level')
    search_fields = ('user__email', 'trx_id', 'sender_number')
    list_editable = ('status',)
    autocomplete_fields = ['user', 'plan']

admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(CheckoutSettings)
class CheckoutSettingsAdmin(admin.ModelAdmin):
    list_display = ('bkash_number', 'page_title')