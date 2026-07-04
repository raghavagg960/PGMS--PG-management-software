from rest_framework import serializers
from .models import Staff

class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'property', 'name', 'role', 'role_display', 'phone', 'salary', 'is_active']