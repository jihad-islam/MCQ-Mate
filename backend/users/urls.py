# backend/users/urls.py
from django.urls import path
from .views import (
    CheckoutView, LoginView, UserProfileView, CheckoutPageDataView,
    PasswordResetRequestView, PasswordResetConfirmView # NEW
)

urlpatterns = [
    path('checkout-data/', CheckoutPageDataView.as_view(), name='checkout-data'), 
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # NEW: Password Reset URLs
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]