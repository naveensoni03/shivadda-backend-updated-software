from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model  # 🚀 YEH IMPORT MISSING THA

from .models import (
    StudentProfile, PhysicalMedicalProfile, AcademicSkillsProfile, 
    ProfessionalJobProfile, SocialHumanityProfile
)
from .serializers import (
    StudentProfileSerializer, PhysicalMedicalSerializer, AcademicSkillsSerializer,
    ProfessionalJobSerializer, SocialHumanitySerializer
)

# Initialize User model
User = get_user_model()

# ==========================================
# 🛑 OLD CODE (Kept for safety)
# ==========================================
class StudentProfileAPI(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(StudentProfileSerializer(StudentProfile.objects.all(), many=True).data)


# ==========================================
# 🚀 MEGA PROFILE API (For Logged-in User)
# ==========================================
class MyMegaProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        medical, _ = PhysicalMedicalProfile.objects.get_or_create(user=user)
        academic, _ = AcademicSkillsProfile.objects.get_or_create(user=user)
        professional, _ = ProfessionalJobProfile.objects.get_or_create(user=user)
        social, _ = SocialHumanityProfile.objects.get_or_create(user=user)

        return Response({
            "medical": PhysicalMedicalSerializer(medical).data,
            "academic": AcademicSkillsSerializer(academic).data,
            "professional": ProfessionalJobSerializer(professional).data,
            "social": SocialHumanitySerializer(social).data,
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        data = request.data

        medical, _ = PhysicalMedicalProfile.objects.get_or_create(user=user)
        academic, _ = AcademicSkillsProfile.objects.get_or_create(user=user)
        professional, _ = ProfessionalJobProfile.objects.get_or_create(user=user)
        social, _ = SocialHumanityProfile.objects.get_or_create(user=user)

        if "medical" in data:
            med_sz = PhysicalMedicalSerializer(medical, data=data["medical"], partial=True)
            if med_sz.is_valid(): med_sz.save()

        if "academic" in data:
            acad_sz = AcademicSkillsSerializer(academic, data=data["academic"], partial=True)
            if acad_sz.is_valid(): acad_sz.save()

        if "professional" in data:
            prof_sz = ProfessionalJobSerializer(professional, data=data["professional"], partial=True)
            if prof_sz.is_valid(): prof_sz.save()

        if "social" in data:
            soc_sz = SocialHumanitySerializer(social, data=data["social"], partial=True)
            if soc_sz.is_valid(): soc_sz.save()

        return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)


# ==========================================
# 🚀 NEW: ADMIN MEGA PROFILE API (For Super Admin/Admin)
# ==========================================
class AdminUserMegaProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # 1. Check if the person requesting is an Admin
        if getattr(request.user, 'role', '') not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({"error": "You do not have permission to view this."}, status=status.HTTP_403_FORBIDDEN)
            
        # 2. Find the target user
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found in database."}, status=status.HTTP_404_NOT_FOUND)

        # 3. Get or Create their profiles
        medical, _ = PhysicalMedicalProfile.objects.get_or_create(user=target_user)
        academic, _ = AcademicSkillsProfile.objects.get_or_create(user=target_user)
        professional, _ = ProfessionalJobProfile.objects.get_or_create(user=target_user)
        social, _ = SocialHumanityProfile.objects.get_or_create(user=target_user)

        # 4. Return everything to Admin
        return Response({
            "user_info": {
                "name": getattr(target_user, 'full_name', target_user.email), 
                "email": target_user.email, 
                "role": target_user.role,
                "status": getattr(target_user, 'account_status', 'ACTIVE')
            },
            "medical": PhysicalMedicalSerializer(medical).data,
            "academic": AcademicSkillsSerializer(academic).data,
            "professional": ProfessionalJobSerializer(professional).data,
            "social": SocialHumanitySerializer(social).data,
        }, status=status.HTTP_200_OK)

    def put(self, request, user_id):
        if getattr(request.user, 'role', '') not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        medical, _ = PhysicalMedicalProfile.objects.get_or_create(user=target_user)
        academic, _ = AcademicSkillsProfile.objects.get_or_create(user=target_user)
        professional, _ = ProfessionalJobProfile.objects.get_or_create(user=target_user)
        social, _ = SocialHumanityProfile.objects.get_or_create(user=target_user)

        if "medical" in data:
            med_sz = PhysicalMedicalSerializer(medical, data=data["medical"], partial=True)
            if med_sz.is_valid(): med_sz.save()

        if "academic" in data:
            acad_sz = AcademicSkillsSerializer(academic, data=data["academic"], partial=True)
            if acad_sz.is_valid(): acad_sz.save()

        if "professional" in data:
            prof_sz = ProfessionalJobSerializer(professional, data=data["professional"], partial=True)
            if prof_sz.is_valid(): prof_sz.save()

        if "social" in data:
            soc_sz = SocialHumanitySerializer(social, data=data["social"], partial=True)
            if soc_sz.is_valid(): soc_sz.save()

        return Response({"message": "User Profile updated successfully by Admin!"}, status=status.HTTP_200_OK)