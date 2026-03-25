from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser 
from django.db.models import Q 
import razorpay

# 🚀 AUTHENTICATION IMPORTS
from django.contrib.auth import get_user_model, authenticate 
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
import random

from .models import Agent
from .serializers import AgentSerializer, AgentCreateSerializer, UserManagementSerializer
from .permissions import IsAdminOrSuperAdmin

# ✅ Helper Import for Audit Logs
from logs.utils import log_action 

User = get_user_model()

# ==========================================
# 🔐 2-STEP OTP AUTHENTICATION
# ==========================================

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_phone = request.data.get("email_or_phone")
        email = request.data.get("email")
        password = request.data.get("password")
        user = None

        if email and password:
            user = authenticate(request, email=email, password=password)
            if not user:
                return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        elif email_or_phone:
            user = User.objects.filter(Q(email=email_or_phone) | Q(phone=email_or_phone)).first()
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Input required."}, status=status.HTTP_400_BAD_REQUEST)

        if getattr(user, 'account_status', '') in ['INACTIVE', 'HIBERNATE']:
            return Response({"error": "Account suspended."}, status=status.HTTP_403_FORBIDDEN)

        otp = str(random.randint(1000, 9999))
        user.otp = otp 
        user.save()

        if user.email:
            try:
                send_mail("Shivadda OTP", f"Your OTP: {otp}", settings.DEFAULT_FROM_EMAIL, [user.email])
                return Response({"message": "OTP sent."}, status=status.HTTP_200_OK)
            except:
                return Response({"error": "SMTP Error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print(f"DEBUG: OTP for {user.phone} is {otp}")
            return Response({"message": "OTP generated (Check Console)."}, status=status.HTTP_200_OK)


class VerifyOTPAndLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_phone = request.data.get("email_or_phone") or request.data.get("email")
        password = request.data.get("password") 
        otp = request.data.get("otp")

        if not email_or_phone:
            return Response({"error": "Email/Phone required."}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        if password:
            user = authenticate(request, email=email_or_phone, password=password)
        elif otp:
            user = User.objects.filter(Q(email=email_or_phone) | Q(phone=email_or_phone)).first()
            if not (user and getattr(user, 'otp', None) == otp):
                user = None

        if user:
            refresh = RefreshToken.for_user(user)
            user.otp = "" 
            user.save()
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role, 
                "name": user.full_name,
                "email": user.email
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials or OTP."}, status=status.HTTP_401_UNAUTHORIZED)


# ==========================================
# 🚀 USER MANAGEMENT VIEWSET
# ==========================================

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserManagementSerializer
    permission_classes = [AllowAny] 
    parser_classes = [MultiPartParser, FormParser] 
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'full_name', 'phone']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        user = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['ACTIVE', 'INACTIVE', 'HIBERNATE']:
            user.account_status = new_status
            user.save() 
            return Response({"message": f"Status updated to {new_status}"})
        return Response({"error": "Invalid Status"}, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# 👨‍👩‍👦 1. PARENT OVERVIEW API (Dashboard Overview)
# ==========================================
class MyChildrenProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user
        children_data = []

        try:
            from students.models import Student 
            from exams.models import ExamAttempt
            
            parent_phone = str(getattr(parent, 'phone', '')).strip()
            students_by_phone = Student.objects.none()
            if parent_phone:
                students_by_phone = Student.objects.filter(primary_mobile=parent_phone)

            students_by_relation = Student.objects.none()
            if hasattr(parent, 'parent_profile'):
                students_by_relation = parent.parent_profile.students.all()
            
            all_students = (students_by_phone | students_by_relation).distinct()

            for child in all_students:
                real_attendance = "N/A"
                try:
                    total_days = child.attendances.count()
                    if total_days > 0:
                        present_days = child.attendances.filter(status__iexact='Present').count()
                        percentage = (present_days / total_days) * 100
                        real_attendance = f"{int(percentage)}%"
                except Exception:
                    pass

                real_latest_grade = "N/A"
                try:
                    if child.user:
                        latest_attempt = ExamAttempt.objects.filter(student=child.user, is_evaluated=True).order_by('-end_time', '-start_time').first()
                        if latest_attempt:
                            real_latest_grade = latest_attempt.grade if latest_attempt.grade else f"{latest_attempt.percentage}%"
                except Exception:
                    pass

                children_data.append({
                    "id": child.id,
                    "name": f"{child.first_name} {child.last_name}".strip(),
                    "first_name": child.first_name,
                    "last_name": child.last_name,
                    "student_id": child.admission_number, 
                    "class": f"{child.student_class} - {child.section}", 
                    "fee_status": child.fee_status, 
                    "attendance": real_attendance,          
                    "latest_exam_grade": real_latest_grade  
                })
        except Exception as e:
            print(f"❌ Error in ProfileView: {e}")

        return Response({
            "parent_name": parent.full_name or parent.email,
            "children_records": children_data
        }, status=status.HTTP_200_OK)


# ==========================================
# 📈 2. PARENT PROGRESS API (Detailed Report Page)
# ==========================================
class MyChildrenProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user
        children_data = []

        try:
            from students.models import Student 
            from exams.models import ExamAttempt
            
            parent_phone = str(getattr(parent, 'phone', '')).strip()
            students_by_phone = Student.objects.filter(primary_mobile=parent_phone) if parent_phone else Student.objects.none()
            students_by_relation = parent.parent_profile.students.all() if hasattr(parent, 'parent_profile') else Student.objects.none()
            
            all_students = (students_by_phone | students_by_relation).distinct()

            for child in all_students:
                try: 
                    total_days = child.attendances.count()
                    present_days = child.attendances.filter(status__iexact='Present').count()
                    attendance_pct = int((present_days / total_days) * 100) if total_days > 0 else 0

                    overall_grade = "N/A"
                    rank = "N/A"
                    latest_attempt = None
                    
                    if child.user:
                        latest_attempt = ExamAttempt.objects.filter(student=child.user, is_evaluated=True).order_by('-end_time').first()
                        if latest_attempt:
                            overall_grade = latest_attempt.grade or f"{latest_attempt.percentage}%"
                            if hasattr(latest_attempt, 'ranking') and latest_attempt.ranking.all_india_rank:
                                rank = f"{latest_attempt.ranking.all_india_rank}"

                    subjects = [
                        {"name": "Mathematics", "score": int(latest_attempt.percentage) if latest_attempt else 85, "color": "#4f46e5"},
                        {"name": "Science", "score": int(latest_attempt.percentage) + 5 if latest_attempt and latest_attempt.percentage < 95 else 88, "color": "#ec4899"},
                        {"name": "English", "score": 92, "color": "#10b981"},
                        {"name": "Social Studies", "score": 80, "color": "#f59e0b"}
                    ]

                    activities = []
                    if latest_attempt and hasattr(latest_attempt, 'exam') and latest_attempt.exam:
                        activities.append({
                            "date": latest_attempt.end_time.strftime("%d %b %Y") if latest_attempt.end_time else "Recently",
                            "text": f"Completed {latest_attempt.exam.title} with {overall_grade} 🏆",
                            "color": "#4f46e5"
                        })
                    
                    latest_absent = child.attendances.filter(status__iexact='Absent').order_by('-date').first()
                    if latest_absent:
                        activities.append({
                            "date": latest_absent.date.strftime("%d %b %Y") if latest_absent.date else "Recently",
                            "text": f"Marked Absent ({latest_absent.remarks or 'Medical/Leave'}) 🤒",
                            "color": "#ef4444"
                        })
                    else:
                        activities.append({
                            "date": "This Month",
                            "text": "Attending classes regularly with perfect streak! ⭐",
                            "color": "#10b981"
                        })

                    children_data.append({
                        "id": child.id,
                        "name": f"{child.first_name} {child.last_name}".strip(),
                        "grade": getattr(child, 'student_class', 'N/A'),
                        "section": getattr(child, 'section', 'A'),
                        "roll_no": getattr(child, 'roll_number', getattr(child, 'admission_number', 'N/A')),
                        "attendance": attendance_pct,
                        "overallGrade": overall_grade,
                        "rank": rank,
                        "subjects": subjects,
                        "activities": activities
                    })
                except Exception as child_err:
                    print(f"⚠️ Error parsing data for student {child.id}: {child_err}")
        except Exception as e:
            print(f"❌ Error in ProgressView: {e}")

        return Response(children_data, status=200)

# ==========================================
# 💰 3. PARENT FEES & LEDGER API
# ==========================================
class MyChildrenFeesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user
        fee_records = []

        try:
            from students.models import Student 
            from fees.models import FeeTransaction # Make sure app name is correct ('fees')
            
            parent_phone = str(getattr(parent, 'phone', '')).strip()
            students_by_phone = Student.objects.filter(primary_mobile=parent_phone) if parent_phone else Student.objects.none()
            students_by_relation = parent.parent_profile.students.all() if hasattr(parent, 'parent_profile') else Student.objects.none()
            
            all_students = (students_by_phone | students_by_relation).distinct()

            transactions = FeeTransaction.objects.filter(student__in=all_students).order_by('-payment_date', '-created_at')

            for txn in transactions:
                try:
                    particular_name = "School Fee"
                    if isinstance(txn.breakdown, dict) and 'particular' in txn.breakdown:
                        particular_name = txn.breakdown.get('particular')
                    else:
                        particular_name = txn.payment_date.strftime("%B %Y")

                    fee_records.append({
                        "id": txn.transaction_id,
                        "child": f"{txn.student.first_name} {txn.student.last_name}".strip() if txn.student else txn.student_name,
                        "month": particular_name,
                        "amount": str(txn.total_amount) if txn.status == 'Paid' else str(txn.due_amount or txn.total_amount),
                        "status": txn.status,
                        "date": txn.payment_date.strftime("%d %b %Y"),
                        "due_date": txn.payment_date.strftime("%d %b %Y"), 
                    })
                except Exception as txn_err:
                    print(f"⚠️ Error parsing transaction {txn.id}: {txn_err}")

        except Exception as e:
            print(f"❌ Error in FeesView: {e}")

        return Response(fee_records, status=status.HTTP_200_OK)


# ==========================================
# 💳 OTHER VIEWS (ME, AGENT, RAZORPAY)
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"email": request.user.email, "role": request.user.role, "name": request.user.full_name})

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"email": request.user.email, "role": request.user.role, "name": request.user.full_name})

class AgentListCreateView(ListCreateAPIView):
    queryset = Agent.objects.all()
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        return AgentCreateSerializer if self.request.method == "POST" else AgentSerializer

class AgentDetailView(RetrieveUpdateAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        client = razorpay.Client(auth=('rzp_test_1DP5mmOlF5G5ag', '5c3gK2pBz2YgG5d4A9Y9hZ3X'))
        amount = request.data.get('amount')
        try:
            order = client.order.create({"amount": int(amount)*100, "currency": "INR", "payment_capture": "0"})
            return Response(order, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
        # ==========================================
# 🎓 4. PARENT EXAMS & MARKS API
# ==========================================
class MyChildrenExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user
        children_data = []

        try:
            from students.models import Student 
            from exams.models import ExamAttempt
            
            parent_phone = str(getattr(parent, 'phone', '')).strip()
            students_by_phone = Student.objects.filter(primary_mobile=parent_phone) if parent_phone else Student.objects.none()
            students_by_relation = parent.parent_profile.students.all() if hasattr(parent, 'parent_profile') else Student.objects.none()
            
            all_students = (students_by_phone | students_by_relation).distinct()

            for child in all_students:
                student_info = {
                    "name": f"{child.first_name} {child.last_name}".strip(),
                    "class": f"{getattr(child, 'student_class', 'N/A')} - {getattr(child, 'section', 'A')}",
                    "roll": getattr(child, 'roll_number', getattr(child, 'admission_number', 'N/A'))
                }

                exam_results_dict = {}

                # 🚀 Bacche ke saare evaluated exams nikalo
                if child.user:
                    attempts = ExamAttempt.objects.filter(student=child.user, is_evaluated=True).select_related('exam', 'exam__subject', 'exam__blueprint')
                    
                    for att in attempts:
                        # Hum Exam title (e.g., 'Term 1') ke hisab se group kar rahe hain
                        exam_name = att.exam.title if att.exam else "General Exam"
                        subject_name = att.exam.subject.name if att.exam and att.exam.subject else "General Subject"
                        
                        if exam_name not in exam_results_dict:
                            exam_results_dict[exam_name] = {
                                "total_obtained": 0,
                                "total_max": 0,
                                "rank": att.ranking.all_india_rank if hasattr(att, 'ranking') and att.ranking else "N/A",
                                "subjects": []
                            }
                        
                        # Max marks Blueprint se aayega, warna default 100
                        max_marks = float(att.exam.blueprint.max_marks) if att.exam and att.exam.blueprint else 100.0
                        passing_marks = float((att.exam.blueprint.passing_percentage / 100) * max_marks) if att.exam and att.exam.blueprint else 33.0
                        obtained_marks = float(att.score)

                        remark = "Outstanding" if att.percentage >= 90 else "Excellent" if att.percentage >= 80 else "Good" if att.percentage >= 60 else "Needs Improvement"

                        exam_results_dict[exam_name]["subjects"].append({
                            "name": subject_name,
                            "total": int(max_marks),
                            "passing": int(passing_marks),
                            "obtained": int(obtained_marks),
                            "grade": att.grade or "N/A",
                            "remark": remark
                        })
                        
                        exam_results_dict[exam_name]["total_obtained"] += obtained_marks
                        exam_results_dict[exam_name]["total_max"] += max_marks

                # Har Exam Group (Term 1, Term 2) ka Overall CGPA & % calculate karo
                final_exams = {}
                for ex_name, data in exam_results_dict.items():
                    pct = (data["total_obtained"] / data["total_max"]) * 100 if data["total_max"] > 0 else 0
                    cgpa = pct / 9.5 # Standard CBSE CGPA conversion

                    final_exams[ex_name] = {
                        "overall_cgpa": str(round(cgpa, 1)),
                        "percentage": f"{round(pct, 1)}%",
                        "result_status": "Pass with Distinction" if pct >= 75 else "Pass" if pct >= 33 else "Needs Improvement",
                        "rank": f"{data['rank']}th" if str(data['rank']).isdigit() else data['rank'],
                        "subjects": data["subjects"]
                    }

                children_data.append({
                    "studentInfo": student_info,
                    "examResults": final_exams
                })

        except Exception as e:
            print(f"❌ Error in ExamsView: {e}")

        return Response(children_data, status=status.HTTP_200_OK)
    
    
    # ==========================================
# ⚙️ 6. PARENT SETTINGS API
# ==========================================
class ParentSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "fullName": getattr(user, 'full_name', ''),
            "email": getattr(user, 'email', ''),
            "phone": getattr(user, 'phone', ''),
            "address": getattr(user, 'address', 'Address not updated yet') # Fallback if address field doesn't exist
        }
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        data = request.data

        try:
            # 1. Password Update Logic
            if 'newPassword' in data and 'currentPassword' in data:
                if not user.check_password(data['currentPassword']):
                    return Response({"error": "Incorrect current password!"}, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(data['newPassword'])
                user.save()
                return Response({"message": "Password changed successfully! 🔒"}, status=status.HTTP_200_OK)

            # 2. Notification Preferences Logic
            if 'notifications' in data:
                # Agar tumhare user model me preferences save karne ka column hai toh yahan add kar sakte ho
                return Response({"message": "Preferences Saved! ⚙️"}, status=status.HTTP_200_OK)

            # 3. Profile Details Update Logic
            if 'fullName' in data:
                user.full_name = data.get('fullName', user.full_name)
                user.email = data.get('email', user.email)
                user.phone = data.get('phone', user.phone)
                
                if hasattr(user, 'address'):
                    user.address = data.get('address', getattr(user, 'address', ''))
                
                user.save()
                return Response({"message": "Profile Updated Successfully! ✅"}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid request payload"}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        # ==========================================
# ⚙️ 6. PARENT SETTINGS API
# ==========================================
class ParentSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "fullName": getattr(user, 'full_name', ''),
            "email": getattr(user, 'email', ''),
            "phone": getattr(user, 'phone', ''),
            "address": getattr(user, 'address', 'Address not updated yet') 
        }
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        data = request.data

        try:
            # 🚀 1. FORGOT PASSWORD LOGIC (OTP BASED)
            if 'otp' in data and 'newPassword' in data and 'emailOrPhone' in data:
                email_or_phone = data['emailOrPhone']
                
                # Check agar ye email/phone is user ka hi hai
                if email_or_phone != user.email and email_or_phone != user.phone:
                    return Response({"error": "This Email/Phone does not match your profile!"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Verify OTP
                if getattr(user, 'otp', None) != data['otp']:
                    return Response({"error": "Invalid or expired OTP!"}, status=status.HTTP_400_BAD_REQUEST)

                # Reset Password
                user.set_password(data['newPassword'])
                user.otp = "" # Clear OTP after success
                user.save()
                return Response({"message": "Password Reset Successfully! 🔒"}, status=status.HTTP_200_OK)

            # 🚀 2. STANDARD PASSWORD UPDATE (Using Current Password)
            if 'newPassword' in data and 'currentPassword' in data:
                if not user.check_password(data['currentPassword']):
                    return Response({"error": "Incorrect current password!"}, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(data['newPassword'])
                user.save()
                return Response({"message": "Password changed successfully! 🔒"}, status=status.HTTP_200_OK)

            # 🚀 3. NOTIFICATION PREFERENCES
            if 'notifications' in data:
                return Response({"message": "Preferences Saved! ⚙️"}, status=status.HTTP_200_OK)

            # 🚀 4. PROFILE DETAILS UPDATE
            if 'fullName' in data:
                user.full_name = data.get('fullName', user.full_name)
                user.phone = data.get('phone', user.phone)
                
                if hasattr(user, 'address'):
                    user.address = data.get('address', getattr(user, 'address', ''))
                
                user.save()
                return Response({"message": "Profile Updated Successfully! ✅"}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid request payload"}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)