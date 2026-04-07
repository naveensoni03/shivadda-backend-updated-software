from .models import AcademicLevel, AcademicClass
from rest_framework import serializers
from .models import AcademicLevel, Course, Batch, Subject, Lesson, Resource, VirtualClass

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

    # 🔥 NAYA UPDATE: Faculty ki details frontend pe bhejne ke liye custom field
    faculty = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'
        
    # 🔥 NAYA UPDATE: Ye function automatically teacher ka data nikal kar set karega
    def get_faculty(self, obj):
        user = getattr(obj, 'created_by', None)
        if user:
            return {
                "name": getattr(user, 'full_name', getattr(user, 'username', 'Unknown Teacher')),
                "username": getattr(user, 'username', 'N/A'),
                "email": getattr(user, 'email', 'N/A'),
                "specialization": getattr(user, 'post_nature', 'Expert Faculty') # Ensure 'post_nature' is the right field in your User model
            }
        return None

class AcademicLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicLevel
        fields = '__all__'

class AcademicClassSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    class Meta:
        model = AcademicClass
        fields = '__all__'