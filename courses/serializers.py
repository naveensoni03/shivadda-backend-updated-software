from rest_framework import serializers
from .models import Course, Batch, Subject, Lesson, Resource, VirtualClass

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    class Meta:
        model = Lesson
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class VirtualClassSerializer(serializers.ModelSerializer):
    # Read-only names for UI display
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    batch_name = serializers.CharField(source='batch.name', read_only=True)

    class Meta:
        model = VirtualClass
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    # Note: Nested serializers are good for reading, but be careful with performance on large lists
    batches = BatchSerializer(many=True, read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    # lessons = LessonSerializer(many=True, read_only=True) # Commented to avoid heavy load on list view

    class Meta:
        model = Course
        fields = '__all__'