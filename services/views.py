from rest_framework import viewsets
from .models import (
    EducationLevel, 
    ServiceType, 
    ServiceMode, 
    ManagementType, 
    PlaceCodeMapping
)
from .serializers import (
    EducationLevelSerializer, 
    ServiceTypeSerializer, 
    ServiceModeSerializer,
    ManagementTypeSerializer,
    PlaceCodeMappingSerializer
)

class EducationLevelViewSet(viewsets.ModelViewSet):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

class ServiceModeViewSet(viewsets.ModelViewSet):
    queryset = ServiceMode.objects.all()
    serializer_class = ServiceModeSerializer

# --- NEWLY ADDED VIEWSETS ---

class ManagementTypeViewSet(viewsets.ModelViewSet):
    queryset = ManagementType.objects.all()
    serializer_class = ManagementTypeSerializer

class PlaceCodeMappingViewSet(viewsets.ModelViewSet):
    queryset = PlaceCodeMapping.objects.all()
    serializer_class = PlaceCodeMappingSerializer