from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Staff
from .serializers import StaffSerializer

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Staff.objects.filter(property__owner=self.request.user)