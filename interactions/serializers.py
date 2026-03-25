from rest_framework import serializers
from .models import CourseReview, Doubt, DoubtReply

class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model = CourseReview
        fields = '__all__'

class DoubtReplySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = DoubtReply
        fields = '__all__'

class DoubtSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    replies = DoubtReplySerializer(many=True, read_only=True)
    class Meta:
        model = Doubt
        fields = '__all__'
