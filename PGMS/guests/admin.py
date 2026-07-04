from django.contrib import admin
from .models import Guest

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'room', 'phone', 'monthly_rent', 'status')
    list_filter = ('status', 'property')
    search_fields = ('name', 'phone')