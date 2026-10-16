from rest_framework import viewsets, permissions, exceptions
from .models import Room
from .serializers import RoomSerializer

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 1. Staff / Warden Access: Filter rooms by assigned property
        if hasattr(user, 'staff_profile') and user.staff_profile.property:
            queryset = Room.objects.filter(property=user.staff_profile.property)
        else:
            # 2. Owner Access: Filter rooms across properties owned by user
            queryset = Room.objects.filter(property__owner=user)

        # Retain property filter query parameter if sent from frontend dropdown
        property_id = self.request.query_params.get('property')
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        # Prevent staff members from creating new rooms
        if hasattr(user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not permitted to add rooms.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        # Prevent staff members from editing room structural details
        if hasattr(user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not permitted to edit room structures.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        # Prevent staff members from deleting rooms
        if hasattr(user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not permitted to delete rooms.")
        instance.delete()