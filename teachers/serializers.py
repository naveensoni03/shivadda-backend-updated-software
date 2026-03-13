from rest_framework import serializers
from .models import Teacher, StudyMaterial, TeacherMail # 🔥 TeacherMail import kiya

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'


class StudyMaterialSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    class_name = serializers.CharField(source='subject_class', required=False) # Frontend ke map ke liye
    type = serializers.CharField(source='material_type', required=False)

    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'class_name', 'type', 'description', 'file', 'date']

    def get_date(self, obj):
        return obj.uploaded_at.strftime("%d %b %Y")


# ==========================================
# 🔥 NAYA: TEACHER MAILBOX SERIALIZER
# ==========================================
class TeacherMailSerializer(serializers.ModelSerializer):
    # React frontend jaisa data maang raha hai, waisa rename kar rahe hain
    sender = serializers.CharField(source='sender_name', required=False)
    email = serializers.CharField(source='sender_email', required=False)
    isRead = serializers.BooleanField(source='is_read', required=False)
    isStarred = serializers.BooleanField(source='is_starred', required=False)
    hasAttachment = serializers.BooleanField(source='has_attachment', required=False)
    
    # Custom Formatted Fields (Time, Date, Avatar)
    time = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = TeacherMail
        fields = [
            'id', 'sender', 'email', 'subject', 'snippet', 'body', 
            'folder', 'label', 'isRead', 'isStarred', 'hasAttachment', 
            'time', 'date', 'avatar', 'attachment'
        ]

    # Time format karega jaise: "10:30 AM"
    def get_time(self, obj):
        return obj.created_at.strftime("%I:%M %p")

    # Date logic: Agar aaj ka hai to "Today", kal ka "Yesterday", warna "Mar 9"
    def get_date(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if obj.created_at.date() == now.date():
            return "Today"
        elif obj.created_at.date() == (now - timezone.timedelta(days=1)).date():
            return "Yesterday"
        return obj.created_at.strftime("%b %d")

    # Sender ke naam ka pehla letter avatar me dikhane ke liye
    def get_avatar(self, obj):
        if obj.sender_name:
            return obj.sender_name[0].upper()
        return "U" # Unknown ke liye U