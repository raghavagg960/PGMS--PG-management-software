from rest_framework import serializers
from .models import Staff

class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    property_name = serializers.ReadOnlyField(source='property.name')

    class Meta:
        model = Staff
        fields = ['id', 'property', 'property_name', 'name', 'role', 'role_display', 'phone', 'salary', 'is_active']