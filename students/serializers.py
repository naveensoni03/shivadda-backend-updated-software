from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    # 🚀 NEW: Frontend ko directly login ID bhejne ke liye (Read Only)
    login_id = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Student
        fields = "__all__"
        
        # 🛡️ SECURITY: In fields ko frontend se direct update nahi kiya ja sakta.
        # Naya user create karna ya role assign karna sirf views.py se hoga.
        read_only_fields = [
            'user', 
            'role', 
            'created_at', 
            'admission_date'
        ]