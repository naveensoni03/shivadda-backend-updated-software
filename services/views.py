from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

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
    Notice,                 
    SupportTicket,          
    MailboxStat,            
    GlobalSettings          # 🔥 NEW IMPORT
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
    NoticeSerializer,               
    SupportTicketSerializer,        
    MailboxStatSerializer,          
    GlobalSettingsSerializer        # 🔥 NEW IMPORT
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


# ==========================================
# 🔥 SUPER ADMIN: GLOBAL SETTINGS API (NEW)
# ==========================================
class GlobalSettingsAPIView(APIView):
    # GET: Frontend par current settings dikhane ke liye
    def get(self, request):
        try:
            settings = GlobalSettings.load()
            serializer = GlobalSettingsSerializer(settings)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # PATCH: Super Admin jab koi setting change/update kare
    def patch(self, request):
        try:
            settings = GlobalSettings.load()
            # partial=True matlab sirf jo data bheja hai wahi update hoga
            serializer = GlobalSettingsSerializer(settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Global settings updated successfully!",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
from django.core.serializers import deserialize
from .models import RecycleBinItem
from .serializers import RecycleBinItemSerializer

# ==========================================
# 🔥 SUPER ADMIN: RECYCLE BIN API
# ==========================================
class RecycleBinAPIView(APIView):
    # GET: Trash mein padi hui saari files (deleted items) dikhayega
    def get(self, request):
        try:
            items = RecycleBinItem.objects.all()
            serializer = RecycleBinItemSerializer(items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RestoreRecycleBinAPIView(APIView):
    # POST: Trash se item ko wapas main database mein zinda karega
    def post(self, request, pk):
        try:
            trash_item = RecycleBinItem.objects.get(pk=pk)
            
            # JSON Snapshot ko wapas Django Object mein convert karna
            deserialized_objects = list(deserialize('json', trash_item.object_data))
            
            for obj in deserialized_objects:
                obj.save() # Wapas original table mein save kar diya!
                
            # Zinda hone ke baad Trash se hata do
            trash_item.delete() 
            
            return Response({"message": f"{trash_item.object_repr} restored successfully!"}, status=status.HTTP_200_OK)
        
        except RecycleBinItem.DoesNotExist:
            return Response({"error": "Item not found in Recycle Bin"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)