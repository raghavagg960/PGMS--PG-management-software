from rest_framework import serializers
from .models import Room
from guests.serializers import GuestMinimalSerializer  # Cross-app import

class RoomSerializer(serializers.ModelSerializer):
    """ Used for creating or updating physical room/inventory data """
    sharing_display = serializers.CharField(source='get_sharing_type_display', read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'property', 'floor_number', 'room_number', 'sharing_type', 
            'sharing_display', 'has_ac', 'has_attached_bathroom', 'total_beds', 'total_almirahs'
        ]

class RoomDetailSerializer(serializers.ModelSerializer):
    """ Ultimate serializer for the dashboard layout (Rooms + Live Occupants) """
    sharing_display = serializers.CharField(source='get_sharing_type_display', read_only=True)
    # Automatically collects guests belonging to this room via the model's related_name='guests'
    guests = GuestMinimalSerializer(many=True, read_only=True)
    current_occupancy = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'floor_number', 'room_number', 'sharing_display', 
            'has_ac', 'has_attached_bathroom', 'total_beds', 'guests', 'current_occupancy'
        ]

    def get_current_occupancy(self, obj):
        # Dynamically calculate active renters on the fly
        return obj.guests.filter(status='active').count()