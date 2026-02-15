from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, LocationViewSet, InstitutionViewSet, ServiceViewSet, SaveRecordingView

router = DefaultRouter()
router.register(r'questions', QuestionViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'institutions', InstitutionViewSet)
router.register(r'services', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # --- ✅ NEW RECORDING URL ADDED HERE ---
    path('save-recording/', SaveRecordingView.as_view(), name='save-recording'),
]