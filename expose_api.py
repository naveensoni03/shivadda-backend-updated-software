import os

BASE_DIR = os.getcwd()
API_DIR = os.path.join(BASE_DIR, "api")

print(f"ðŸ”§ Exposing Global APIs (Schools, Locations, Services)...")

# --- 1. UPDATE SERIALIZERS.PY ---
serializers_code = """from rest_framework import serializers
from .models import Question, Institution, Location, Service

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
"""
with open(os.path.join(API_DIR, "serializers.py"), "w") as f:
    f.write(serializers_code)
print("âœ… Updated serializers.py")

# --- 2. UPDATE VIEWS.PY ---
views_code = """from rest_framework import viewsets
from .models import Question, Institution, Location, Service
from .serializers import QuestionSerializer, InstitutionSerializer, LocationSerializer, ServiceSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
"""
with open(os.path.join(API_DIR, "views.py"), "w") as f:
    f.write(views_code)
print("âœ… Updated views.py")

# --- 3. UPDATE URLS.PY ---
urls_code = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, LocationViewSet, InstitutionViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'institutions', InstitutionViewSet)
router.register(r'services', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
"""
with open(os.path.join(API_DIR, "urls.py"), "w") as f:
    f.write(urls_code)
print("âœ… Updated urls.py")

print("\nðŸŽ‰ API is Open! Now Schools & Locations are accessible.")
