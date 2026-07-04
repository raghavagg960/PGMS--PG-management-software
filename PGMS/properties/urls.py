from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterOwnerView, CustomLoginView, PGPropertyViewSet

router = DefaultRouter()
router.register(r'properties', PGPropertyViewSet, basename='property')

urlpatterns = [
    path('auth/register/', RegisterOwnerView.as_view(), name='owner-register'),
    path('auth/login/', CustomLoginView.as_view(), name='owner-login'),
    path('', include(router.urls)),
]