from rest_framework import viewsets
from .models import EducationLevel, ServiceType, ServiceMode
from .serializers import EducationLevelSerializer, ServiceTypeSerializer, ServiceModeSerializer

class EducationLevelViewSet(viewsets.ModelViewSet):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

class ServiceModeViewSet(viewsets.ModelViewSet):
    queryset = ServiceMode.objects.all()
    serializer_class = ServiceModeSerializer