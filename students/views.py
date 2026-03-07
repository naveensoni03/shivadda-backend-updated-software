from django.db import transaction
from django.contrib.auth import get_user_model
from django.apps import apps
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError

from .models import Student
from .serializers import StudentSerializer
from datetime import datetime

User = get_user_model()

# ==========================================
# 1. LIST & CREATE STUDENT (With Auth User Creation)
# ==========================================
class StudentListCreateView(generics.ListCreateAPIView):
    # Sabse naye students hamesha upar
    queryset = Student.objects.all().order_by('-id')
    serializer_class = StudentSerializer
    parser_classes = (MultiPartParser, FormParser) 
    permission_classes = [AllowAny] 
    
    # Pagination OFF taki ek bhi bachha hide na ho
    pagination_class = None

    def post(self, request, *args, **kwargs):
        if hasattr(request.data, '_mutable'):
            request.data._mutable = True
            data = request.data
        else:
            try:
                data = request.data.copy()
            except AttributeError:
                data = request.data
                
        is_new_student = str(data.get('is_new_student', '')).lower() == 'true'

        try:
            with transaction.atomic():
                user_obj = None
                
                # --- NAYA USER ACCOUNT BANAO ---
                if is_new_student:
                    email = data.get('email')
                    password = data.get('password')
                    first_name = data.get('first_name', '')
                    last_name = data.get('last_name', '')
                    full_name_str = f"{first_name} {last_name}".strip()

                    if not email or not password:
                        return Response({"error": "Email and Password are required!"}, status=status.HTTP_400_BAD_REQUEST)

                    # 🔥 Agar Email pehle se hai toh Crash nahi hoga!
                    if User.objects.filter(email=email).exists():
                        return Response({"error": f"Bhai dhyan de: Yeh Email ({email}) pehle se kisi aur student ki hai. Nayi email daal!"}, status=status.HTTP_400_BAD_REQUEST)

                    user_obj = User.objects.create(
                        email=email,
                        full_name=full_name_str,
                        role='Student',
                        is_active=True
                    )
                    user_obj.set_password(password)
                    user_obj.save()

                # --- STUDENT PROFILE SAVE KARO ---
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True) 

                if user_obj:
                    serializer.save(user=user_obj)
                else:
                    serializer.save()
                    
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("❌ STUDENT CREATION ERROR:", str(e))
            return Response({"error": f"Internal Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 2. DETAIL, UPDATE & DELETE 
# ==========================================
class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]


# ==========================================
# 3. QUICK TOGGLE 
# ==========================================
class StudentToggleStatus(generics.UpdateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    def patch(self, request, *args, **kwargs):
        student = self.get_object()
        student.is_active = not student.is_active
        student.save()
        return Response({"status": student.is_active, "message": "Status updated successfully"})


# ==========================================
# 4. DASHBOARD ANALYTICS 
# ==========================================
@api_view(['GET'])
def student_count(request):
    count = Student.objects.count()
    return Response({'count': count})


# ==========================================
# 5. CHANGE PASSWORD VIEW
# ==========================================
class ChangePasswordView(APIView):
    # Sirf login user hi apna password badal sakta hai
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        # Check agar dono fields bheje hain
        if not old_password or not new_password:
            return Response({"error": "Old password and New password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if old password is correct
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)


# ==========================================
# 6. STUDENT DASHBOARD SUMMARY VIEW
# ==========================================
class StudentDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        actual_enrolled_count = 0
        
        # 1. Total Courses Count
        try:
            Course = apps.get_model('courses', 'Course')
            actual_enrolled_count = Course.objects.filter(is_active=True).count()
        except Exception as e:
            print(f"❌ Dashboard Course Count Error: {e}")
            actual_enrolled_count = 0

        # 2. 🚀 REAL TIMETABLE FETCH (Today's Schedule)
        schedule_list = []
        try:
            Schedule = apps.get_model('timetable', 'Schedule')
            
            # Aaj kon sa din hai? ('Mon', 'Tue', 'Wed', etc.)
            current_day = datetime.now().strftime('%a') 
            
            # Database se aaj ki classes filter karo
            todays_classes = Schedule.objects.filter(day=current_day).order_by('start_time')
            
            for cls in todays_classes:
                # Time format: 10:00 AM
                start = cls.start_time.strftime('%I:%M %p') if hasattr(cls, 'start_time') and cls.start_time else "TBA"
                end = cls.end_time.strftime('%I:%M %p') if hasattr(cls, 'end_time') and cls.end_time else ""
                
                # Subject ka naam nikalna (Foreign key handle karna)
                subject_name = str(getattr(cls, 'subject', 'Class'))
                topic_name = str(getattr(cls, 'topic', getattr(cls, 'description', 'Regular Class')))
                
                schedule_list.append({
                    "id": cls.id,
                    "time": start,
                    "duration": f"Till {end}" if end else "Scheduled",
                    "subject": subject_name,
                    "topic": topic_name,
                    "is_live": False  # Abhi ke liye False
                })
        except Exception as e:
            print(f"❌ Timetable Fetch Error: {e}")
            schedule_list = [] # Agar koi class nahi hai, toh khali chhod do

        # Dashboard Data Combine
        data = {
            "stats": {
                "enrolled_courses": actual_enrolled_count, 
                "attendance_percentage": 92.0,
                "average_cgpa": 84.5,
                "performance_growth": 12.0
            },
            "schedule": schedule_list,  # ✅ Yahan backend wali Asli List bhej di
            "tasks": [
                {
                    "id": 1,
                    "title": "Chemistry Practical File",
                    "due": "Today, 11:59 PM",
                    "type": "assignment",
                    "urgent": True
                }
            ],
            "performance_chart": [
                {"label": "M1", "value": 70},
                {"label": "M2", "value": 50},
                {"label": "M3", "value": 85},
                {"label": "M4", "value": 60},
                {"label": "M5", "value": 92},
            ]
        }
        
        return Response(data)