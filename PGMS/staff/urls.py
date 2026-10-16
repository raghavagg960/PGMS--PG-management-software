from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, UserMeView

router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', UserMeView.as_view(), name='user_me'),
]