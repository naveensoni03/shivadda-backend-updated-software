from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count  # 🚀 YE IMPORT ZAROORI HAI
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherListCreateView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all().order_by('-created_at')
    serializer_class = TeacherSerializer

class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

@api_view(['GET'])
def teacher_count(request):
    count = Teacher.objects.count()
    return Response({'count': count})

@api_view(['GET'])
def department_stats(request):
    # 🚀 FIX: 'subject' ki jagah 'department' use kiya taaki real stats dikhein
    stats = Teacher.objects.values('department').annotate(count=Count('id')).order_by('-count')
    
    formatted_stats = []
    for item in stats:
        # Field ka naam 'department' hai
        dept_name = item['department'].strip() if item['department'] else "General"
        formatted_stats.append({
            "department": dept_name,
            "count": item['count']
        })
        
    return Response(formatted_stats)