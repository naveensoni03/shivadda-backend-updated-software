from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Question, Institution, Location, Service, ClassRecording
from .serializers import QuestionSerializer, InstitutionSerializer, LocationSerializer, ServiceSerializer, RecordingSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

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

    @action(detail=False, methods=['get'])
    def types(self, request):
        return Response([]) 
    
    @action(detail=False, methods=['get'])
    def levels(self, request):
        return Response([])

    @action(detail=False, methods=['get'])
    def modes(self, request):
        return Response([])

# --- ✅ NEW RECORDING VIEW ADDED HERE ---
class SaveRecordingView(APIView):
    parser_classes = (MultiPartParser, FormParser) # Video upload handle karne ke liye

    def post(self, request, *args, **kwargs):
        print("Video received...", request.data) # Terminal me debug print
        serializer = RecordingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Video Saved Successfully!", "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)