from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from .models import Student
from .serializers import StudentSerializer
from rest_framework.response import Response

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny] 

class StudentToggleStatus(generics.UpdateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def patch(self, request, *args, **kwargs):
        student = self.get_object()
        student.is_active = not student.is_active
        student.save()
        return Response({"status": student.is_active})
    
    
    
    
    
# students/views.py ke end mein paste karein

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def student_count(request):
    """Total students count return karega"""
    count = Student.objects.count()
    return Response({'count': count})