from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'property', 'floor_number', 'sharing_type', 'has_ac')
    list_filter = ('floor_number', 'sharing_type', 'has_ac', 'property')