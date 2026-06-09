from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SubscriptionPlan, CheckoutSettings
from .serializers import CheckoutSerializer, UserProfileUpdateSerializer, SubscriptionPlanSerializer, SubscriptionSerializer, CheckoutSettingsSerializer

class SubscriptionPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # ফ্রন্টএন্ড শুধু অ্যাক্টিভ প্ল্যানগুলোই দেখতে পাবে
        plans = SubscriptionPlan.objects.filter(is_active=True)
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckoutPageDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = CheckoutSettings.objects.first()
        plans = SubscriptionPlan.objects.filter(is_active=True)
        
        settings_data = CheckoutSettingsSerializer(settings).data if settings else None
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
            
            # ইউজারের সব সাবস্ক্রিপশনের স্ট্যাটাস চেক করা
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
            "subscriptions": subs_data # এখন এটি একটি Array রিটার্ন করবে
        }
        
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)