from rest_framework import serializers
from .models import Guest

class GuestSerializer(serializers.ModelSerializer):
    """ Main serializer for onboarding and updating guest data """
    class Meta:
        model = Guest
        fields = [
            'id', 'property', 'room', 'name', 'phone', 
            'hometown_address', 'organization', 'monthly_rent', 
            'move_in_date', 'status'
        ]

class GuestMinimalSerializer(serializers.ModelSerializer):
    """ Lightweight representation to nest inside room/bed views """
    class Meta:
        model = Guest
        fields = ['id', 'name', 'phone', 'status']