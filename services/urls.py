from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import EducationLevelViewSet, ServiceTypeViewSet, ServiceModeViewSet

router = DefaultRouter()
router.register(r'levels', EducationLevelViewSet)
router.register(r'types', ServiceTypeViewSet)
router.register(r'modes', ServiceModeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]