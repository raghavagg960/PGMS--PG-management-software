from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from .models import Guest
from .serializers import GuestSerializer

class GuestViewSet(viewsets.ModelViewSet):
    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 1. Staff / Warden access
        if hasattr(user, 'staff_profile') and user.staff_profile.property:
            queryset = Guest.objects.filter(room__property=user.staff_profile.property)
        else:
            # 2. Owner access
            queryset = Guest.objects.filter(room__property__owner=user)

        # Retain property filtering query param if present
        property_id = self.request.query_params.get('property')
        if property_id:
            queryset = queryset.filter(room__property_id=property_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        
        # If staff, ensure the room selected belongs to their assigned PG
        if hasattr(user, 'staff_profile') and user.staff_profile.property:
            room = serializer.validated_data.get('room')
            if room and room.property != user.staff_profile.property:
                raise exceptions.PermissionDenied("You can only check in guests to rooms within your assigned PG property.")
                
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user

        # If staff, ensure updated room assignment stays within their assigned PG
        if hasattr(user, 'staff_profile') and user.staff_profile.property:
            room = serializer.validated_data.get('room')
            if room and room.property != user.staff_profile.property:
                raise exceptions.PermissionDenied("You can only move guests to rooms within your assigned PG property.")

        serializer.save()