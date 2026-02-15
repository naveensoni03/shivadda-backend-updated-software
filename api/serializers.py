from rest_framework import serializers
from .models import Question, Institution, Location, Service, ClassRecording

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

# --- ✅ NEW RECORDING SERIALIZER ADDED HERE ---
class RecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRecording
        fields = '__all__'