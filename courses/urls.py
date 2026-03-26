from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicLevelViewSet, AcademicClassViewSet
from .views import (
    CourseViewSet, BatchViewSet, SubjectViewSet, 
    LessonViewSet, ResourceViewSet, VirtualClassViewSet
)

router = DefaultRouter()
router.register(r'list', CourseViewSet, basename='courses')
router.register(r'batches', BatchViewSet, basename='batches')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'lessons', LessonViewSet, basename='lessons')
router.register(r'resources', ResourceViewSet, basename='resources')
router.register(r'live-classes', VirtualClassViewSet, basename='live-classes')
router.register(r'academic-levels', AcademicLevelViewSet)
router.register(r'academic-classes', AcademicClassViewSet)

urlpatterns = [
    path('', include(router.urls)),
]