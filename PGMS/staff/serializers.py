from rest_framework import serializers
from .models import Staff
from django.contrib.auth.models import User

class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    property_name = serializers.ReadOnlyField(source='property.name')
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'user', 'username', 'email', 'property', 'property_name', 'name', 'role', 'role_display', 'phone', 'salary', 'is_active']
        read_only_fields = ['user']

    def update(self, instance, validated_data):
        # Update staff fields
        instance = super().update(instance, validated_data)

        # Sync email and name to the linked Django user account if it exists
        if instance.user:
            if 'email' in validated_data:
                instance.user.email = validated_data['email']
            if 'name' in validated_data:
                instance.user.first_name = validated_data['name']
            instance.user.save()

        return instance