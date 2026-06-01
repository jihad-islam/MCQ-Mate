# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Subscription

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'bkash_number']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['status', 'expiry_date', 'trx_id', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    bkash_number = serializers.CharField(max_length=15)
    trx_id = serializers.CharField(max_length=100)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_trx_id(self, value):
        if Subscription.objects.filter(trx_id=value).exists():
            raise serializers.ValidationError("This TrxID has already been used.")
        return value

    def create(self, validated_data):
        # Email থেকে username তৈরি করা হচ্ছে
        username = validated_data['email'].split('@')[0]
        
        # User তৈরি করা
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            bkash_number=validated_data['bkash_number']
        )
        
        # Pending subscription তৈরি করা
        Subscription.objects.create(
            user=user,
            trx_id=validated_data['trx_id'],
            status='pending'
        )
        
        return user