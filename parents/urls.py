from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParentProfileViewSet

router = DefaultRouter()
router.register(r'profile', ParentProfileViewSet, basename='parent-profile')

urlpatterns = [
    path('', include(router.urls)),
]