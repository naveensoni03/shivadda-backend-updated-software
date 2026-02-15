from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet

router = DefaultRouter()
# ✅ FIX: Yahan empty string '' rakhein taaki URL double na ho
router.register(r'', InstitutionViewSet, basename='institution')

urlpatterns = [
    path('', include(router.urls)),
]