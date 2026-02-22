from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    EducationLevelViewSet, 
    ServiceTypeViewSet, 
    ServiceModeViewSet,
    ManagementTypeViewSet,        
    PlaceCodeMappingViewSet,
    NatureOfServiceViewSet,         
    ServiceSeekerGroupViewSet,      
    ServiceProviderGroupViewSet,    
    ServiceChargeViewSet,
    NoticeViewSet,                  # ✅ NEW
    SupportTicketViewSet,           # ✅ NEW
    MailboxStatViewSet              # ✅ NEW
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

# --- 🚀 NEW COMMUNICATION ROUTES ---
router.register(r'notices', NoticeViewSet)
router.register(r'tickets', SupportTicketViewSet)
router.register(r'mailbox-stats', MailboxStatViewSet)

urlpatterns = [
    path('', include(router.urls)),
]