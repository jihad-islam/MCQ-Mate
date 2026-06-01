# backend/users/urls.py
from django.urls import path
from .views import CheckoutView, LoginView, UserProfileView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]