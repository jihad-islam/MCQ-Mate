# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Subscription, SubscriptionPlan
from .models import CheckoutSettings 

User = get_user_model()

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'price', 'discounted_price', 'valid_until']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'bkash_number']

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    # UPDATE: Automatically fetch expiry_date from the associated Plan
    expiry_date = serializers.DateTimeField(source='plan.valid_until', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'plan_name', 'status', 'expiry_date', 'trx_id', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    bkash_number = serializers.CharField(max_length=15)
    trx_id = serializers.CharField(max_length=100)
    plan_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_trx_id(self, value):
        if Subscription.objects.filter(trx_id=value).exists():
            raise serializers.ValidationError("This TrxID has already been used.")
        return value

    def create(self, validated_data):
        username = validated_data['email'].split('@')[0]
        plan_ids = validated_data.pop('plan_ids')
        
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            bkash_number=validated_data['bkash_number']
        )
        
        for plan_id in plan_ids:
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
                Subscription.objects.create(
                    user=user,
                    plan=plan,
                    trx_id=validated_data['trx_id'],
                    sender_number=validated_data['bkash_number'],
                    status='pending',
                    # UPDATE: expiry_date no longer saved directly on Subscription
                )
            except SubscriptionPlan.DoesNotExist:
                continue
        
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['name', 'password']

    def update(self, instance, validated_data):
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            
        instance.save()
        return instance

class CheckoutSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckoutSettings
        fields = ['bkash_number', 'page_title', 'page_subtitle', 'benefits']