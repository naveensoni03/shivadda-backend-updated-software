from .serializers import AcademicLevelSerializer, AcademicClassSerializer
from .models import AcademicLevel, AcademicClass
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# 🔥 Yahan AllowAny import kiya hai
from rest_framework.permissions import IsAuthenticated, AllowAny 
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q  # 🔥 Zaruri: Complex filtering ke liye

from .models import Course, Batch, Subject, Lesson, Resource, VirtualClass, LessonProgress
from .serializers import (
    CourseSerializer, BatchSerializer, SubjectSerializer, 
    LessonSerializer, ResourceSerializer, VirtualClassSerializer
)

# ==========================================
# 1. COURSE VIEWSET (With Universal Filters)
# ==========================================
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    # permission_classes = [permissions.IsAuthenticated] # Production me enable karein
    
    # Standard Search & Filter Backends
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['institution', 'is_active']
    search_fields = ['name', 'code', 'description']

    # 🔥 NEW: UNIVERSAL SELECTION BOX LOGIC (Client Hierarchy)
    def get_queryset(self):
        # Default order: Newest first
        queryset = Course.objects.all().order_by('-created_at')

        # Frontend se aane wale query parameters catch karo
        place = self.request.query_params.get('place')
        service = self.request.query_params.get('service')
        class_filter = self.request.query_params.get('class')

        # 🌍 1. Place Hierarchy Filter (Continent, Country, State, District etc.)
        if place and place != "ALL_PLACES":
            # Ye database me state, district ya unique place_id search karega
            queryset = queryset.filter(
                Q(state__iexact=place) | 
                Q(place_id__iexact=place)
            )

        # 📚 2. Service Filter (Foundation, Preparatory, Middle, Secondary)
        if service and service != "ALL_SERVICES":
            queryset = queryset.filter(service_id__iexact=service)

        # 🎓 3. Class / Academic Level Filter
        if class_filter and class_filter != "ALL_CLASSES":
            queryset = queryset.filter(student_class__iexact=class_filter)

        return queryset

    # 🌟 NAYA: Course Progress API (Student Dashboard ke liye)
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


# ==========================================
# 2. BATCH VIEWSET
# ==========================================
class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'is_active']


# ==========================================
# 3. SUBJECT VIEWSET
# ==========================================
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']


# ==========================================
# 4. LESSON VIEWSET (With Progress Toggle)
# ==========================================
class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().order_by('order')
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'subject']

    # 🌟 NAYA: Toggle Lesson Progress API (Complete/Incomplete mark karne ke liye)
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


# ==========================================
# 5. RESOURCE VIEWSET
# ==========================================
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer


# ==========================================
# 6. VIRTUAL CLASS VIEWSET (Live Classes)
# ==========================================
class VirtualClassViewSet(viewsets.ModelViewSet):
    queryset = VirtualClass.objects.all().order_by('-scheduled_at')
    serializer_class = VirtualClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['batch']

    def perform_create(self, serializer):
        # Creator automatically assign karein
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
            

# ==========================================
# 7. PHASE 2: ACADEMIC HIERARCHY VIEWSETS
# ==========================================
class AcademicLevelViewSet(viewsets.ModelViewSet):
    queryset = AcademicLevel.objects.all()
    serializer_class = AcademicLevelSerializer
    permission_classes = [AllowAny] # 🚀 FIXED: Yahan AllowAny kar diya

class AcademicClassViewSet(viewsets.ModelViewSet):
    queryset = AcademicClass.objects.all()
    serializer_class = AcademicClassSerializer
    permission_classes = [AllowAny] # 🚀 FIXED: Yahan AllowAny kar diya
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['level']