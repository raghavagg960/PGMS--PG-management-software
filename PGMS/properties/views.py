from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import viewsets, generics, permissions, exceptions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import PGProperty
from .serializers import OwnerRegistrationSerializer, PGPropertySerializer

# Public Authentication Handlers
class RegisterOwnerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = OwnerRegistrationSerializer
    permission_classes = [AllowAny]

class CustomLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    class CustomSerializer(TokenObtainPairSerializer):
        def validate(self, attrs):
            data = super().validate(attrs)

            # Safely extract profiles without throwing RelatedObjectDoesNotExist
            owner_profile = getattr(self.user, 'profile', None)
            staff_profile = getattr(self.user, 'staff_profile', None)

            # Resolve mobile number depending on account type
            mobile_number = None
            if owner_profile:
                mobile_number = getattr(owner_profile, 'mobile_number', None)
            elif staff_profile:
                mobile_number = staff_profile.phone

            data['user'] = {
                'id': self.user.id,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'email': self.user.email,
                'mobile_number': mobile_number,
                'role': staff_profile.role if staff_profile else 'owner',
                'is_staff_member': staff_profile is not None,
            }
            return data
    serializer_class = CustomSerializer

# ViewSet exclusively for the Property container
class PGPropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PGPropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff see only their assigned PG; Owners see all their properties
        if hasattr(user, 'staff_profile') and user.staff_profile.property:
            return PGProperty.objects.filter(id=user.staff_profile.property.id)
        return PGProperty.objects.filter(owner=user)

    def perform_create(self, serializer):
        # Prevent staff from creating properties
        if hasattr(self.request.user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not allowed to create new properties.")
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        # Prevent staff from updating properties
        if hasattr(self.request.user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not allowed to edit property details.")
        serializer.save()

    def perform_destroy(self, instance):
        # Prevent staff from deleting properties
        if hasattr(self.request.user, 'staff_profile'):
            raise exceptions.PermissionDenied("Staff members are not allowed to delete properties.")
        instance.delete()