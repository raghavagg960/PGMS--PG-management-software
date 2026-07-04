from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import PGProperty, OwnerProfile


class OwnerRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this email already exists.")]
    )
    
    # FIX: Added write_only=True so Django won't try to look for this field on the User instance after saving
    mobile_number = serializers.CharField(
        write_only=True,
        required=True,
        validators=[UniqueValidator(queryset=OwnerProfile.objects.all(), message="This mobile number is already registered.")]
    )
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'mobile_number', 'email', 'password']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def create(self, validated_data):
        mobile = validated_data.pop('mobile_number')
        
        with transaction.atomic():
            user = User.objects.create_user(
                username=mobile,  
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name']
            )
            OwnerProfile.objects.create(user=user, mobile_number=mobile) 
            
        return user


class PGPropertySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = PGProperty
        fields = ['id', 'owner', 'name', 'address', 'total_floors', 'created_at']