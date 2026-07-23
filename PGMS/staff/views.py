from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Staff
from .serializers import StaffSerializer

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Staff.objects.filter(property__owner=self.request.user)
        property_id = self.request.query_params.get('property')
        if property_id is not None:
            queryset = queryset.filter(property_id=property_id)
        return queryset