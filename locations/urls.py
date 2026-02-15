from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet

router = DefaultRouter()
router.register(r'places', PlaceViewSet, basename='places')

urlpatterns = [
    path('', include(router.urls)),
]