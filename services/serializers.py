from rest_framework import serializers
from .models import (
    EducationLevel, 
    ServiceType, 
    ServiceMode,
    ManagementType,      # ✅ New Model imported
    PlaceCodeMapping     # ✅ New Model imported
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

# --- NEW SERIALIZERS ADDED HERE ---

class ManagementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagementType
        fields = '__all__'

class PlaceCodeMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceCodeMapping
        fields = '__all__'