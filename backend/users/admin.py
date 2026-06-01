# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Subscription

class CustomUserAdmin(UserAdmin):
    # Admin panel-এ কী কী কলাম দেখাবে
    list_display = ('email', 'first_name', 'bkash_number', 'is_staff', 'is_active')
    search_fields = ('email', 'bkash_number', 'first_name')
    ordering = ('email',)

class SubscriptionAdmin(admin.ModelAdmin):
    # Subscription এর ডাটা দেখানোর জন্য
    list_display = ('user', 'status', 'trx_id', 'created_at', 'expiry_date')
    list_filter = ('status',)
    search_fields = ('user__email', 'trx_id')
    # Admin panel এর লিস্ট থেকেই সরাসরি status চেঞ্জ করার জন্য
    list_editable = ('status', 'expiry_date') 

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Subscription, SubscriptionAdmin)