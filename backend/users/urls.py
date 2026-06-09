from django.urls import path
from .views import CheckoutView, LoginView, UserProfileView, CheckoutPageDataView

urlpatterns = [
    # এটি এখন একসাথে plans এবং page settings পাঠাবে
    path('checkout-data/', CheckoutPageDataView.as_view(), name='checkout-data'), 
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]