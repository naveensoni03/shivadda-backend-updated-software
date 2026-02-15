from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import StudentProfile
from .serializers import StudentProfileSerializer

class StudentProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(StudentProfileSerializer(StudentProfile.objects.all(), many=True).data)
