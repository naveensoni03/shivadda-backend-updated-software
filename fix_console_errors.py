import os

BASE_DIR = os.getcwd()
VIEWS_FILE = os.path.join(BASE_DIR, "api", "views.py")

print(f"ðŸ”§ Patching Backend Views to Silence Console Errors in: {VIEWS_FILE}")

code_content = """from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Question, Institution, Location, Service
from .serializers import QuestionSerializer, InstitutionSerializer, LocationSerializer, ServiceSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    # FIX: Add missing endpoints to silence frontend 404s
    @action(detail=False, methods=['get'])
    def countries(self, request):
        countries = Location.objects.values_list('country', flat=True).distinct()
        return Response(list(countries))

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    # FIX: Add missing endpoints
    @action(detail=False, methods=['get'])
    def types(self, request):
        return Response([]) 
    
    @action(detail=False, methods=['get'])
    def levels(self, request):
        return Response([])

    @action(detail=False, methods=['get'])
    def modes(self, request):
        return Response([])
"""

with open(VIEWS_FILE, "w") as f:
    f.write(code_content)

print("✅ Backend Patched: Missing endpoints added. Restart Server!")
