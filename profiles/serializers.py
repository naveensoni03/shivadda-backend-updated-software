from rest_framework import serializers
from .models import (
    StudentProfile, 
    PhysicalMedicalProfile, 
    AcademicSkillsProfile, 
    ProfessionalJobProfile, 
    SocialHumanityProfile
)

# Old Serializer
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = "__all__"

# New Mega Profile Serializers
class PhysicalMedicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalMedicalProfile
        exclude = ['user'] # User ID frontend se dikhane ki zaroorat nahi

class AcademicSkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSkillsProfile
        exclude = ['user']

class ProfessionalJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalJobProfile
        exclude = ['user']

class SocialHumanitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialHumanityProfile
        exclude = ['user']