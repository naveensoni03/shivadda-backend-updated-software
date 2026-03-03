from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        
        # ✨ NEW FIELDS (subclass, subjects, sub_subjects, mailbox_assigned) 
        # are automatically supported here because of '__all__'.

    # 🚀 BONUS TIP: Duplicate Enrollment rokne ke liye validation
    def validate(self, data):
        student = data.get('student')
        course = data.get('course')

        # 'self.instance is None' ka matlab hai ki naya data create ho raha hai (update/edit nahi)
        if self.instance is None and student and course:
            # Check karo kya is student ne is course me pehle se admission liya hua hai
            if Enrollment.objects.filter(student=student, course=course).exists():
                raise serializers.ValidationError(
                    {"error": "Ye student is course me pehle se enrolled hai!"}
                )
        
        return data