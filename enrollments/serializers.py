from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    # --- READ-ONLY FIELDS FOR FRONTEND DISPLAY ---
    # Inse frontend table mein ID ki jagah direct naam dikhega
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    # Choice fields ke readable labels (e.g., 'ACTIVE' -> 'Active / Show')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    fee_status_display = serializers.CharField(source='get_fee_status_display', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name', 
            'class_name', 'subclass', 'subjects', 'sub_subjects', 
            'valid_from', 'valid_to', 'mailbox_assigned', 'mailbox_id', 
            'storage_limit_mb', 'status', 'status_display', 
            'fee_status', 'fee_status_display', 'enrolled_at', 'is_active'
        ]
        
    # 🚀 ADVANCED VALIDATION: Business Logic Rules
    def validate(self, data):
        student = data.get('student')
        course = data.get('course')
        valid_from = data.get('valid_from')
        valid_to = data.get('valid_to')

        # 1. Duplicate Admission Check (Creation ke waqt)
        if self.instance is None and student and course:
            if Enrollment.objects.filter(student=student, course=course).exists():
                raise serializers.ValidationError(
                    {"error": f"Ye student '{course.name}' course me pehle se enrolled hai!"}
                )

        # 2. Date Validity Check
        if valid_from and valid_to:
            if valid_to <= valid_from:
                raise serializers.ValidationError(
                    {"error": "Validity 'To' date hamesha 'From' date ke baad honi chahiye!"}
                )

        return data

    # 🛠️ AUTO-CALCULATION: Enrollment save hone se pehle custom logic
    def create(self, validated_data):
        # Yahan aap extra logic likh sakte hain jo model save hone se pehle chale
        return super().create(validated_data)