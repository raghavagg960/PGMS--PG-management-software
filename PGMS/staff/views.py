from django.contrib.auth.models import User

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response

from .models import Staff
from .serializers import StaffSerializer

class IsOwnerOnly(BasePermission):
    message = "Only the property owner can manage staff."

    def has_permission(self, request, view):
        return request.user.is_authenticated and not hasattr(request.user, 'staff_profile')

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated, IsOwnerOnly]

    def get_queryset(self):
        user = self.request.user

        # 1. Check if the logged-in user is a Staff member / Warden
        if hasattr(user, 'staff_profile'):
            queryset = Staff.objects.filter(property=user.staff_profile.property)
        else:
            # 2. Otherwise, they are an Owner — fetch all staff across their properties
            queryset = Staff.objects.filter(property__owner=user)

        # Retain your original property filter parameter query
        property_id = self.request.query_params.get('property')
        if property_id is not None:
            queryset = queryset.filter(property_id=property_id)

        return queryset

    def perform_create(self, serializer):
        phone = serializer.validated_data.get('phone')
        name = serializer.validated_data.get('name')
        email = serializer.validated_data.get('email')

        username = phone.strip()
        user_account, created = User.objects.get_or_create(username=username)
        if created:
            user_account.set_password('Staff@1234')
            user_account.first_name = name
            if email:
                user_account.email = email
            user_account.save()

        serializer.save(user=user_account)



class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        staff_profile = getattr(user, 'staff_profile', None)
        is_staff_member = staff_profile is not None

        assigned_property_id = None
        assigned_property_name = None
        if staff_profile and staff_profile.property:
            assigned_property_id = staff_profile.property.id
            assigned_property_name = staff_profile.property.name

        full_name = f"{user.first_name} {user.last_name}".strip()

        data = {
            'id': user.id,
            'username': user.username,
            'name': full_name if full_name else user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_owner': not is_staff_member,
            'role': staff_profile.role if is_staff_member else 'owner',
            'is_staff_member': is_staff_member,
            'assigned_property_id': assigned_property_id,
            'assigned_property_name': assigned_property_name,
        }
        return Response(data)