from django.contrib.auth.models import User

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Staff
from .serializers import StaffSerializer

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]

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
        is_staff_member = hasattr(user, 'staff_profile')
        
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_owner': not is_staff_member,
            'role': user.staff_profile.role if is_staff_member else 'owner',
            'assigned_property_id': user.staff_profile.property.id if is_staff_member else None,
            'assigned_property_name': user.staff_profile.property.name if is_staff_member else 'All Properties',
        }
        return Response(data)