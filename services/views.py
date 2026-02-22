from rest_framework import viewsets
from .models import (
    EducationLevel, 
    ServiceType, 
    ServiceMode, 
    ManagementType, 
    PlaceCodeMapping,
    NatureOfService,        
    ServiceSeekerGroup,     
    ServiceProviderGroup,   
    ServiceCharge,
    Notice,                 # ✅ NEW
    SupportTicket,          # ✅ NEW
    MailboxStat             # ✅ NEW
)
from .serializers import (
    EducationLevelSerializer, 
    ServiceTypeSerializer, 
    ServiceModeSerializer,
    ManagementTypeSerializer,
    PlaceCodeMappingSerializer,
    NatureOfServiceSerializer,        
    ServiceSeekerGroupSerializer,     
    ServiceProviderGroupSerializer,   
    ServiceChargeSerializer,
    NoticeSerializer,               # ✅ NEW
    SupportTicketSerializer,        # ✅ NEW
    MailboxStatSerializer           # ✅ NEW
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

# --- 🚀 NEW COMMUNICATION VIEWSETS ---
class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-id')
    serializer_class = NoticeSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all().order_by('-id')
    serializer_class = SupportTicketSerializer

class MailboxStatViewSet(viewsets.ModelViewSet):
    queryset = MailboxStat.objects.all()
    serializer_class = MailboxStatSerializer