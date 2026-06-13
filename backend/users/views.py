# backend/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

from .models import SubscriptionPlan, CheckoutSettings
from .serializers import (
    CheckoutSerializer, UserProfileUpdateSerializer, SubscriptionPlanSerializer, 
    SubscriptionSerializer, CheckoutSettingsSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer # NEW
)

User = get_user_model()

class SubscriptionPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True)
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckoutPageDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = CheckoutSettings.objects.first()
        plans = SubscriptionPlan.objects.filter(is_active=True)
        
        settings_data = CheckoutSettingsSerializer(settings_obj).data if settings_obj else None
        plans_data = SubscriptionPlanSerializer(plans, many=True).data
        
        return Response({
            "settings": settings_data,
            "plans": plans_data
        }, status=status.HTTP_200_OK)

class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Account created and course subscriptions are pending approval."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            subs = user.subscriptions.all()
            has_active = any(sub.status == 'active' for sub in subs)
            overall_status = "active" if has_active else "pending" if subs.exists() else "none"

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name,
                    'is_staff': user.is_staff,
                    'subscription_status': overall_status
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid email or password. Please try again."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        subscriptions = user.subscriptions.all()
        subs_data = SubscriptionSerializer(subscriptions, many=True).data

        data = {
            "name": user.first_name,
            "email": user.email,
            "bkash_number": user.bkash_number,
            "subscriptions": subs_data
        }
        
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# NEW: Password Reset Views
# ==========================================
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            
            if user:
                # Generate Token and UID
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                
                # Construct Reset Link (Using FRONTEND_URL from settings)
                reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
                
                # Send Email
                send_mail(
                    subject="Password Reset Request - MCQMate",
                    message=f"Hello {user.first_name},\n\nClick the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email.",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            
            # Security best practice: Always return same message even if email doesn't exist
            return Response({"message": "If an account with that email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                uid_decoded = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid_decoded)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)