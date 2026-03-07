from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from students.models import Student
from .models import Enrollment
from .serializers import EnrollmentSerializer

# Custom User model access karne ka sahi tarika
User = get_user_model()

class EnrollmentListCreate(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        enrollments = Enrollment.objects.all()
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        # Frontend se 'is_new_student' string bhi aa sakta hai aur boolean bhi, isliye check karein
        is_new_student = str(data.get('is_new_student', '')).lower() == 'true'

        try:
            # 🛡️ Atomic Transaction: User aur Enrollment dono saath me banna chahiye
            with transaction.atomic():
                
                # --- CASE 1: Naya Student Create Karna Hai ---
                if is_new_student:
                    email = data.get('email')
                    password = data.get('password')
                    name = data.get('name', 'Student')

                    if not email or not password:
                        return Response({"error": "Email and Password are required for new student!"}, status=status.HTTP_400_BAD_REQUEST)

                    # 1. Django User Create karein (Username ko email hi bana rahe hain)
                    user, created = User.objects.get_or_create(
                        username=email, 
                        defaults={
                            'email': email,
                            'first_name': name,
                            # 'role': 'Student' # 👈 Agar aapke custom user model me role column hai toh ise uncomment karke 'Student' pass kar sakte ho
                        }
                    )
                    
                    if created:
                        user.set_password(password)
                        user.save()
                    else:
                        # Agar user pehle se hai, toh check karein kya wo student hai
                        print(f"ℹ️ User {email} already exists.")
                    
                    # 2. Student Profile link karein
                    student_obj, _ = Student.objects.get_or_create(user=user)
                    
                    # 🔥 THE MASTER FIX: UUID object ko properly String me convert kiya taaki SQLite crash na kare
                    data['student'] = str(student_obj.id)

                # --- CASE 2: Existing Student ---
                # (Yahan ka faltu code maine uda diya hai. Agar student existing hai, toh frontend automatically data['student'] me string ID bhejta hai, toh use dubara assign karne ki zarurat nahi hoti)

                # 3. Enrollment Serializer se Data Save karein
                serializer = EnrollmentSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                
                # Validation error check
                print("❌ SERIALIZER ERROR:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("❌ SYSTEM ERROR:", str(e))
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EnrollmentDetail(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        enrollment = get_object_or_404(Enrollment, pk=pk)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data)

    def put(self, request, pk):
        enrollment = get_object_or_404(Enrollment, pk=pk)
        data = request.data.copy()
        
        # Safely handling student/course IDs during update
        serializer = EnrollmentSerializer(enrollment, data=data, partial=True) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            enrollment = get_object_or_404(Enrollment, pk=pk)
            enrollment.delete()
            return Response({"message": "Enrollment Cancelled Successfully!"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)