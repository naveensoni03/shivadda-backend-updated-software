import threading
import random
import razorpay
from django.db.models import Q
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import EmailMultiAlternatives # 👈 YEH CHANGE KIYA
from django.conf import settings

from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination

from .models import Agent
from .serializers import AgentSerializer, AgentCreateSerializer, UserManagementSerializer

User = get_user_model()

# ==========================================
# 📧 ASYNC EMAIL HELPER (ANYMAIL BREVO FIX)
# ==========================================
def send_otp_email_async(subject, message, recipient):
    def send():
        try:
            # 👈 YEH NAYA CODE ANYMAIL KE LIYE HAI
            msg = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient]
            )
            msg.send()
        except Exception as e:
            print(f"❌ Async Email Error: {e}")
    threading.Thread(target=send).start()

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
                return Response({"error": "Invalid email or password."}, status=401)
        elif email_or_phone:
            user = User.objects.filter(Q(email=email_or_phone) | Q(phone=email_or_phone)).first()
            if not user:
                return Response({"error": "User not found."}, status=404)
        else:
            return Response({"error": "Input required."}, status=400)

        if getattr(user, 'account_status', '') in ['INACTIVE', 'HIBERNATE']:
            return Response({"error": "Account suspended."}, status=403)

        otp = str(random.randint(1000, 9999))
        user.otp = otp 
        user.save()

        if user.email:
            # Console checking ke liye rakha hai
            print(f"\n==========================================")
            print(f"🚀🚀🚀 OTP FOR {user.email} IS: {otp} 🚀🚀🚀")
            print(f"==========================================\n")
            
            send_otp_email_async("Shivadda Login OTP", f"Your verification code is: {otp}", user.email)
            return Response({"message": "OTP sent successfully! ✅"}, status=200)
        else:
            return Response({"message": f"OTP for phone: {otp} (Check Console)"}, status=200)

class VerifyOTPAndLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email_or_phone = request.data.get("email_or_phone") or request.data.get("email")
        otp = request.data.get("otp")

        if not email_or_phone or not otp:
            return Response({"error": "Data missing."}, status=400)

        user = User.objects.filter(Q(email=email_or_phone) | Q(phone=email_or_phone)).first()
        if user and getattr(user, 'otp', None) == otp:
            refresh = RefreshToken.for_user(user)
            user.otp = "" 
            user.save()
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role, 
                "name": user.full_name,
                "email": user.email
            }, status=200)
        return Response({"error": "Invalid OTP! ❌"}, status=401)

# ==========================================
# 🚀 USER MANAGEMENT & AGENTS
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

class AgentListCreateView(ListCreateAPIView):
    queryset = Agent.objects.all()
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        return AgentCreateSerializer if self.request.method == "POST" else AgentSerializer

class AgentDetailView(RetrieveUpdateAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "email": request.user.email, 
            "role": request.user.role, 
            "name": request.user.full_name
        })

# ==========================================
# 💳 PAYMENTS (RAZORPAY)
# ==========================================
class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        amount = request.data.get('amount')
        
        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

        # ✅ DEMO MODE: Real Razorpay keys nahi hain to demo order return karo
        if not key_id or not key_secret or not key_id.startswith('rzp_'):
            import uuid, time
            demo_order = {
                "id": f"demo_order_{uuid.uuid4().hex[:12]}",
                "amount": int(amount) * 100,
                "currency": "INR",
                "key": "demo_key",
                "demo_mode": True
            }
            return Response(demo_order, status=status.HTTP_200_OK)

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            order = client.order.create({"amount": int(amount)*100, "currency": "INR", "payment_capture": 1})
            order['key'] = key_id
            order['demo_mode'] = False
            return Response(order, status=status.HTTP_200_OK)
        except Exception as e:
            # Razorpay error clearly return karo taaki frontend dikhaye
            error_msg = str(e)
            return Response({"error": f"Razorpay Error: {error_msg}"}, status=status.HTTP_400_BAD_REQUEST)

# 🔥 VERIFICATION VIEW
class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        payment_id = request.data.get('razorpay_payment_id', '')
        order_id = request.data.get('razorpay_order_id', '')
        signature = request.data.get('razorpay_signature', '')
        fee_id = request.data.get('fee_id')
        demo_mode = request.data.get('demo_mode', False)

        # ✅ DEMO MODE: demo payment ko directly verify karo
        if demo_mode or (order_id and order_id.startswith('demo_order_')):
            return Response({"message": "Demo Payment Verified! ✅", "demo": True}, status=status.HTTP_200_OK)

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

        if not key_id or not key_secret:
            return Response({"message": "Payment accepted (keys not configured)."}, status=status.HTTP_200_OK)

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)
            return Response({"message": "Payment verified securely! ✅"}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid payment signature!"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================================
# 👨‍👩‍👦 PARENT DASHBOARD APIs
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
            students_by_phone = Student.objects.filter(primary_mobile=parent_phone) if parent_phone else Student.objects.none()
            students_by_relation = parent.parent_profile.students.all() if hasattr(parent, 'parent_profile') else Student.objects.none()
            all_students = (students_by_phone | students_by_relation).distinct()

            for child in all_students:
                real_attendance = "N/A"
                try:
                    total_days = child.attendances.count()
                    if total_days > 0:
                        present_days = child.attendances.filter(status__iexact='Present').count()
                        real_attendance = f"{int((present_days / total_days) * 100)}%"
                except Exception: pass
                
                real_latest_grade = "N/A"
                try:
                    if child.user:
                        latest_attempt = ExamAttempt.objects.filter(student=child.user, is_evaluated=True).order_by('-end_time', '-start_time').first()
                        if latest_attempt:
                            real_latest_grade = latest_attempt.grade if latest_attempt.grade else f"{latest_attempt.percentage}%"
                except Exception: pass

                children_data.append({
                    "id": child.id,
                    "name": f"{child.first_name} {child.last_name}".strip(),
                    "student_id": child.admission_number, 
                    "class": f"{getattr(child, 'student_class', 'N/A')} - {getattr(child, 'section', 'A')}", 
                    "fee_status": getattr(child, 'fee_status', 'N/A'), 
                    "attendance": real_attendance,          
                    "latest_exam_grade": real_latest_grade  
                })
        except Exception as e: print(f"❌ Error: {e}")
        return Response({"parent_name": parent.full_name or parent.email, "children_records": children_data}, status=status.HTTP_200_OK)

class MyChildrenProgressView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response([], status=200)

class MyChildrenFeesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response([], status=200)

class MyChildrenExamsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response([], status=200)

class ParentSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            "fullName": getattr(user, 'full_name', ''),
            "email": getattr(user, 'email', ''),
            "phone": getattr(user, 'phone', ''),
            "address": getattr(user, 'address', 'Address not updated yet') 
        })
    def patch(self, request):
        user = request.user
        data = request.data
        try:
            if 'otp' in data and 'newPassword' in data:
                if getattr(user, 'otp', None) != data['otp']:
                    return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
                user.set_password(data['newPassword'])
                user.otp = ""
                user.save()
                return Response({"message": "Password Reset Successfully! 🔒"})
            
            user.full_name = data.get('fullName', user.full_name)
            user.phone = data.get('phone', user.phone)
            if hasattr(user, 'address'):
                user.address = data.get('address', user.address)
            user.save()
            return Response({"message": "Profile Updated Successfully! ✅"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        
# ==========================================
# 👑 SUPER ADMIN: MASTER DATA & 360 VIEW
# ==========================================

class MasterGridPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit' # Frontend se ?limit=50 bhej sakte hain
    max_page_size = 100

class SuperAdminMasterGridView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({"error": "Unauthorized Access"}, status=status.HTTP_403_FORBIDDEN)

        role_filter = request.query_params.get('role', None)
        status_filter = request.query_params.get('status', None)
        search_query = request.query_params.get('search', None)
        # Naye Filters
        location_filter = request.query_params.get('location', None)
        service_filter = request.query_params.get('service', None)

        users_query = User.objects.all().order_by('-date_joined')

        if role_filter:
            users_query = users_query.filter(role__iexact=role_filter)
        if status_filter:
            users_query = users_query.filter(account_status__iexact=status_filter)
        if search_query:
            users_query = users_query.filter(
                Q(full_name__icontains=search_query) | 
                Q(email__icontains=search_query) | 
                Q(phone__icontains=search_query)
            )

        paginator = MasterGridPagination()
        paginated_users = paginator.paginate_queryset(users_query, request)
        
        master_data = []
        for user in paginated_users:
            base_info = {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "status": user.account_status,
                "date_joined": user.date_joined.strftime("%Y-%m-%d"),
                "is_otp_enabled": getattr(user, 'is_otp_enabled', False)
            }

            # Related data extract karna (Student/Teacher models se)
            try:
                if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
                    base_info["student_id"] = user.student_profile.admission_number
                    base_info["fee_status"] = user.student_profile.fee_status
                    base_info["location"] = user.student_profile.city # Example location mapping
                    base_info["service"] = user.student_profile.user_group # Example service mapping
            except Exception:
                pass

            master_data.append(base_info)

        return paginator.get_paginated_response(master_data)
    
class ToggleUserOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Security: Sirf Super Admin ya Admin hi OTP change kar sakte hain
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({"error": "Unauthorized Access"}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
            is_otp_enabled = request.data.get('is_otp_enabled')
            
            if is_otp_enabled is not None:
                user.is_otp_enabled = is_otp_enabled
                user.save()
                return Response({"message": f"OTP status updated to {is_otp_enabled} for {user.email}"}, status=200)
            return Response({"error": "Invalid data"}, status=400)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

# ==========================================
# 🔍 360-DEGREE USER PROFILE API
# ==========================================
class User360ViewAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({"error": "Unauthorized Access"}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
            
            # Base Data (Jo har user ke paas hoga)
            data = {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "phone": user.phone or "Not Provided",
                "role": user.role,
                "status": user.account_status,
                "date_joined": user.date_joined.strftime("%B %d, %Y"),
                "financial_status": "N/A",
                "academic_status": "N/A",
                "location": "Global System",
                "service": "Platform Access",
                "recent_activity": []
            }

            # 🎓 Agar User STUDENT hai
            if user.role == 'STUDENT':
                try:
                    student = getattr(user, 'student_profile', None)
                    if student:
                        data["location"] = getattr(student, 'city', 'N/A')
                        data["service"] = getattr(student, 'user_group', 'N/A')
                        
                        # 💰 Finance Check
                        data["financial_status"] = f"{student.fee_status}"
                        if student.fee_status == 'Pending':
                            data["recent_activity"].append("⚠️ Fee is pending.")
                        
                        # 📝 Attendance Check
                        try:
                            total_days = student.attendances.count()
                            if total_days > 0:
                                present_days = student.attendances.filter(status__iexact='Present').count()
                                data["academic_status"] = f"Attendance: {int((present_days / total_days) * 100)}%"
                            else:
                                data["academic_status"] = "Attendance: No Data"
                        except Exception:
                            data["academic_status"] = "Attendance: Pending Sync"
                            
                        # 📊 Exam Check
                        try:
                            from exams.models import ExamAttempt
                            latest_exam = ExamAttempt.objects.filter(student=user, is_evaluated=True).order_by('-end_time').first()
                            if latest_exam:
                                grade = latest_exam.grade if latest_exam.grade else f"{latest_exam.percentage}%"
                                data["recent_activity"].append(f"🎓 Last Exam Scored: {grade}")
                        except Exception:
                            pass
                except Exception as e:
                    print(f"360 View Student Error: {e}")

            # 👩‍🏫 Agar User TEACHER hai
            elif user.role == 'TEACHER':
                data["financial_status"] = "Salary Active (Payroll Linked)"
                data["academic_status"] = "Assigned Batches: Syncing..."
                data["recent_activity"].append("📚 Teacher Dashboard Active")

            # 👨‍👩‍👦 Agar User PARENT hai
            elif user.role == 'PARENT':
                data["financial_status"] = "Checking Child Fee Ledger..."
                data["academic_status"] = "Tracking Child Progress"

            return Response(data, status=200)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)