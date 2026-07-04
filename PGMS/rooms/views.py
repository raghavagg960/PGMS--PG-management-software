from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Room
from .serializers import RoomSerializer, RoomDetailSerializer

class RoomViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return RoomDetailSerializer
        return RoomSerializer

    def get_queryset(self):
        queryset = Room.objects.filter(property__owner=self.request.user)
        floor = self.request.query_params.get('floor_number')
        if floor is not None:
            queryset = queryset.filter(floor_number=floor)
        return queryset