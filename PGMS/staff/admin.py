from django.contrib import admin
from .models import Staff

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    # This adds clean column rows on your admin list screen so it's readable at a glance
    list_display = ('name', 'property', 'role', 'phone', 'is_active')
    list_filter = ('role', 'is_active', 'property')