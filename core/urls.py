from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter 
from rest_framework import serializers

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from chatbot.views import AIChatAPI
from visitors.views import VisitorViewSet

# ✨ NEW: Imported OTP Views from accounts
from accounts.views import UserManagementViewSet, SendOTPView, VerifyOTPAndLoginView 

from students.views import ChangePasswordView

User = get_user_model()

# ==========================================
# 🛑 OLD CUSTOM JWT SERIALIZER (Ab YAHI use hoga Standard Login ke liye)
# ==========================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email_input = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if email_input and password:
            user_obj = User.objects.filter(email=email_input).first()

            if user_obj:
                if user_obj.check_password(password):
                    self.user = user_obj
                    refresh = self.get_token(self.user)
                    data = {}
                    data['refresh'] = str(refresh)
                    data['access'] = str(refresh.access_token)

                    if self.user.is_superuser:
                        data['role'] = "Super Admin"
                    else:
                        data['role'] = getattr(self.user, 'role', 'Student')
                        
                    data['name'] = getattr(self.user, 'full_name', email_input)
                    return data
                else:
                    raise serializers.ValidationError("Incorrect password.")
            else:
                 raise serializers.ValidationError("User account not found.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ==========================================
# ROUTERS & VIEWS
# ==========================================
router = DefaultRouter()
router.register(r'visitors', VisitorViewSet, basename='visitors')
router.register(r'users', UserManagementViewSet, basename='users')

def create_live_admin(request):
    email = 'user2@gmail.com'
    password = 'user' 

    if not User.objects.filter(email=email).exists():
        try:
            user = User.objects.create_superuser(email=email, password=password)
            if hasattr(user, 'full_name'):
                user.full_name = 'Super Admin'
            user.save()
            return HttpResponse(f"<h1>✅ Live Superuser Created!</h1><p><b>Email:</b> {email}</p><p><b>Password:</b> {password}</p>")
        except Exception as e:
            return HttpResponse(f"<h1>❌ Error:</h1> <p>{e}</p>")
    else:
        return HttpResponse("<h1>⚠️ Superuser pehle se bana hua hai!</h1>")

def home(request):
    return HttpResponse("<h1 style='text-align:center; padding-top:50px;'>Backend is Running! 🚀</h1>")


# ==========================================
# URL PATTERNS
# ==========================================
urlpatterns = [
    path('api/interactions/', include('interactions.urls')),
    path("", home),
    path("admin/", admin.site.urls),
    
    # 🔥 FIX: OTP wali API ka raasta alag kar diya, aur Login wali ka alag kar diya 🔥
    path('api/auth/send-otp/', SendOTPView.as_view(), name='send_otp'),       
    path('api/auth/verify-otp/', VerifyOTPAndLoginView.as_view(), name='verify_otp'), # Agar OTP se login karna ho
    
    # 🚀 YEH HAI AAPKA MAIN FIX 🚀 -> Ab /api/auth/login/ password accept karega!
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'), 
    
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('setup-live-admin/', create_live_admin), 
    path("api/", include(router.urls)), 
    path("api/auth/", include("accounts.urls")), 
    path("api/dashboard/", include("dashboard.urls")),
    path("api/agents/", include("agents.urls")),
    path("api/logs/", include("logs.urls")),
    path("api/students/", include("students.urls")),
    path("api/teachers/", include("teachers.urls")),
    
    # ✨ NEW: Added Parents API Route here! ✨
    path("api/parents/", include("parents.urls")),
    
    path("api/institutions/", include("institutions.urls")),
    path('api/locations/', include('locations.urls')),
    path('api/centers/', include('centers.urls')),  
    path('api/services/', include('services.urls')),
    path("api/courses/", include("courses.urls")),
    path("api/batches/", include("batches.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/fees/", include("fees.urls")),              
    path("api/exams/", include("exams.urls")),            
    path("api/lms/", include("lms.urls")),
    path("api/library/", include("library.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/hostel/", include("hostel.urls")),   
    path("api/transport/", include("transport.urls")), 
    path("api/payroll/", include("payroll.urls")),
    path('api/timetable/', include('timetable.urls')),
    path("api/news/", include("news.urls")), 
    path('api/chat/', AIChatAPI.as_view()),
    path("api/profiles/", include("profiles.urls")),
    
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)