from django.shortcuts import render

from django.contrib.auth.models import User

from rest_framework import viewsets, generics
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
            data['user'] = {
                'id': self.user.id,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'email': self.user.email,
                'mobile_number': getattr(self.user.profile, 'mobile_number', None)
            }
            return data
    serializer_class = CustomSerializer

# ViewSet exclusively for the Property container
class PGPropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PGPropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PGProperty.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)