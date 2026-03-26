from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    # 🚀 FIX: Username ki jagah Email use karein (Kyunki login email se hai)
    login_id = serializers.CharField(source='user.email', read_only=True)
    
    # ✨ NEW: Student ke sath Parent ka naam bhi frontend ko bhejne ke liye
    parent_name = serializers.CharField(source='parent.user.full_name', read_only=True, default="No Parent Linked")
    parent_phone = serializers.CharField(source='parent.user.phone', read_only=True, default="N/A")

    class Meta:
        model = Student
        fields = "__all__"
        
        # 🛡️ SECURITY: In fields ko frontend se direct update nahi kiya ja sakta.
        read_only_fields = [
            'user', 
            'role', 
            'created_at', 
            'admission_date',
            # 'parent'  <-- Agar parent sirf backend/admin dashboard se assign karna hai, 
            # toh isko comment se hata dena, warna forms se bhi assign ho payega.
        ]