from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Course, Batch, Subject, Lesson, Resource, VirtualClass
from .serializers import (
    CourseSerializer, BatchSerializer, SubjectSerializer, 
    LessonSerializer, ResourceSerializer, VirtualClassSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    # permission_classes = [permissions.IsAuthenticated] # Production me On karein
    
    # ✅ Search & Filter Added
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['institution', 'is_active'] # Filter by School ID
    search_fields = ['name', 'code', 'description'] # Search by Name

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'is_active']

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().order_by('order')
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'subject']

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

class VirtualClassViewSet(viewsets.ModelViewSet):
    queryset = VirtualClass.objects.all().order_by('-scheduled_at')
    serializer_class = VirtualClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['batch']

    def perform_create(self, serializer):
        # Agar user logged in hai to usko creator set karo
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()