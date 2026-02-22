from rest_framework import serializers
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

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = '__all__'

class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class ServiceModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceMode
        fields = '__all__'

class ManagementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagementType
        fields = '__all__'

class PlaceCodeMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceCodeMapping
        fields = '__all__'

class NatureOfServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NatureOfService
        fields = '__all__'

class ServiceSeekerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceSeekerGroup
        fields = '__all__'

class ServiceProviderGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProviderGroup
        fields = '__all__'

class ServiceChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCharge
        fields = '__all__'

# --- 🚀 NEW COMMUNICATION SERIALIZERS ---
class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'

class MailboxStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailboxStat
        fields = '__all__'