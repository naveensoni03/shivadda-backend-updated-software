from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Course, Batch, Subject, Lesson, Resource, VirtualClass, LessonProgress
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

    # 🌟 NAYA: Course Progress API
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def my_progress(self, request, pk=None):
        course = self.get_object()
        
        # Find all lessons completed by this specific user for this course
        completed = LessonProgress.objects.filter(
            user=request.user, 
            lesson__course=course, 
            is_completed=True
        ).values_list('lesson_id', flat=True)
        
        total_lessons = course.lessons.count()
        percentage = (len(completed) / total_lessons * 100) if total_lessons > 0 else 0
        
        return Response({
            "completed_lessons": list(completed),
            "percentage": round(percentage)
        })

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

    # 🌟 NAYA: Toggle Lesson Progress API
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_progress(self, request, pk=None):
        lesson = self.get_object()
        
        # Get or create progress record for this user and lesson
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user, 
            lesson=lesson
        )
        
        # Toggle completion status
        progress.is_completed = not progress.is_completed
        progress.save()
        
        return Response({"is_completed": progress.is_completed})

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