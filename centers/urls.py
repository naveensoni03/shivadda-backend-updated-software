from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamCenterViewSet

router = DefaultRouter()
router.register(r'', ExamCenterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]