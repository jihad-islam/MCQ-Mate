# backend/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CheckoutSerializer

class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Account created successfully. Subscription is pending approval."}, 
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
            
            # BUG FIX 1: Login এর সময়ও subscription status বের করে আনা হচ্ছে
            try:
                sub_status = user.subscription.status
            except:
                sub_status = "pending"

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name,
                    'is_staff': user.is_staff,
                    # Subscription object frontend এ পাঠানো হচ্ছে
                    'subscription': {
                        'status': sub_status
                    }
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
        
        try:
            subscription = user.subscription
            sub_data = {
                "status": subscription.status,
                "trx_id": subscription.trx_id,
                "expiry_date": subscription.expiry_date
            }
        except:
            sub_data = {
                "status": "pending",
                "trx_id": "N/A",
                "expiry_date": None
            }

        data = {
            "name": user.first_name,
            "email": user.email,
            "bkash_number": user.bkash_number,
            "subscription": sub_data
        }
        
        return Response(data, status=status.HTTP_200_OK)