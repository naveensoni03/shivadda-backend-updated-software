from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    EducationLevelViewSet, 
    ServiceTypeViewSet, 
    ServiceModeViewSet,
    ManagementTypeViewSet,        
    PlaceCodeMappingViewSet,
    NatureOfServiceViewSet,         # ✅ NEW
    ServiceSeekerGroupViewSet,      # ✅ NEW
    ServiceProviderGroupViewSet,    # ✅ NEW
    ServiceChargeViewSet            # ✅ NEW
)

router = DefaultRouter()
router.register(r'levels', EducationLevelViewSet)
router.register(r'types', ServiceTypeViewSet)
router.register(r'modes', ServiceModeViewSet)
router.register(r'management', ManagementTypeViewSet)
router.register(r'place-codes', PlaceCodeMappingViewSet)

# --- 🚀 NEW SUPER ADMIN ROUTES ---
router.register(r'nature', NatureOfServiceViewSet)
router.register(r'seekers', ServiceSeekerGroupViewSet)
router.register(r'providers', ServiceProviderGroupViewSet)
router.register(r'charges', ServiceChargeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]