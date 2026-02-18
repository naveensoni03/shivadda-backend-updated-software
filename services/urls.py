from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    EducationLevelViewSet, 
    ServiceTypeViewSet, 
    ServiceModeViewSet,
    ManagementTypeViewSet,        # ✅ New ViewSet
    PlaceCodeMappingViewSet       # ✅ New ViewSet
)

router = DefaultRouter()
router.register(r'levels', EducationLevelViewSet)
router.register(r'types', ServiceTypeViewSet)
router.register(r'modes', ServiceModeViewSet)

# --- NEW ROUTES ADDED HERE ---
router.register(r'management', ManagementTypeViewSet)
router.register(r'place-codes', PlaceCodeMappingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]