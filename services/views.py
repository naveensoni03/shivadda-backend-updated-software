from rest_framework import viewsets
from .models import (
    EducationLevel, 
    ServiceType, 
    ServiceMode, 
    ManagementType, 
    PlaceCodeMapping,
    NatureOfService,        # ✅ NEW
    ServiceSeekerGroup,     # ✅ NEW
    ServiceProviderGroup,   # ✅ NEW
    ServiceCharge           # ✅ NEW
)
from .serializers import (
    EducationLevelSerializer, 
    ServiceTypeSerializer, 
    ServiceModeSerializer,
    ManagementTypeSerializer,
    PlaceCodeMappingSerializer,
    NatureOfServiceSerializer,        # ✅ NEW
    ServiceSeekerGroupSerializer,     # ✅ NEW
    ServiceProviderGroupSerializer,   # ✅ NEW
    ServiceChargeSerializer           # ✅ NEW
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

class ManagementTypeViewSet(viewsets.ModelViewSet):
    queryset = ManagementType.objects.all()
    serializer_class = ManagementTypeSerializer

class PlaceCodeMappingViewSet(viewsets.ModelViewSet):
    queryset = PlaceCodeMapping.objects.all()
    serializer_class = PlaceCodeMappingSerializer

# --- 🚀 NEW SUPER ADMIN VIEWSETS ---

class NatureOfServiceViewSet(viewsets.ModelViewSet):
    queryset = NatureOfService.objects.all()
    serializer_class = NatureOfServiceSerializer

class ServiceSeekerGroupViewSet(viewsets.ModelViewSet):
    queryset = ServiceSeekerGroup.objects.all()
    serializer_class = ServiceSeekerGroupSerializer

class ServiceProviderGroupViewSet(viewsets.ModelViewSet):
    queryset = ServiceProviderGroup.objects.all()
    serializer_class = ServiceProviderGroupSerializer

class ServiceChargeViewSet(viewsets.ModelViewSet):
    queryset = ServiceCharge.objects.all()
    serializer_class = ServiceChargeSerializer