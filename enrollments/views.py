from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Enrollment
from .serializers import EnrollmentSerializer

class EnrollmentListCreate(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        enrollments = Enrollment.objects.all()
        data = []
        
        for e in enrollments:
            # ✅ SAFETY CHECK: Student ka naam dhoondne ka "Foolproof" tareeka
            display_name = "Student " + str(e.student.id) 
            
            try:
                if hasattr(e.student, 'first_name') and e.student.first_name:
                    display_name = e.student.first_name
                elif hasattr(e.student, 'name') and e.student.name:
                    display_name = e.student.name
                elif hasattr(e.student, 'username') and e.student.username:
                    display_name = e.student.username
                elif hasattr(e.student, 'user'):
                    display_name = e.student.user.first_name or e.student.user.username
            except Exception:
                pass 

            data.append({
                "id": e.id,
                "student": e.student.id,
                "student_name": display_name, 
                "course": e.course.id,
                "course_name": e.course.name, 
                "enrolled_at": e.enrolled_at,
            })
            
        return Response(data)

    def post(self, request):
        # Frontend se aa rahe data (strings) ko safely integers mein convert kar rahe hain taaki 400 error na aaye
        data = request.data.copy()
        try:
            if 'student' in data: data['student'] = int(data['student'])
            if 'course' in data: data['course'] = int(data['course'])
        except Exception:
            pass

        serializer = EnrollmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Agar error aata hai toh yahan terminal me saaf dikhega
        print("❌ POST 400 ERROR REASON:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🚀 NEW CLASS: DELETE REQUEST KO HANDLE KARNE KE LIYE
class EnrollmentDetail(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            # Bachhe ka enrollment record dhoondo
            enrollment = get_object_or_404(Enrollment, pk=pk)
            # Record delete karo
            enrollment.delete()
            return Response({"message": "Enrollment Cancelled Successfully!"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print("❌ DELETE ERROR:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)