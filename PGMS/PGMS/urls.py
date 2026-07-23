# Open and update core/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Aggregated Application API Layer
    path('api/', include('properties.urls')),
    path('api/', include('staff.urls')),
    path('api/', include('rooms.urls')),
    path('api/', include('guests.urls')),
    path('api/', include('notifications.urls')),
]
