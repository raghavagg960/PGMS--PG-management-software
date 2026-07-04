from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Guest
from .serializers import GuestSerializer

class GuestViewSet(viewsets.ModelViewSet):
    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Guest.objects.filter(property__owner=self.request.user)