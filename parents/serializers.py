from rest_framework import serializers
from .models import ParentProfile

class ParentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentProfile
        fields = '__all__'