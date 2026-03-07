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
from accounts.views import UserManagementViewSet

from students.views import ChangePasswordView

User = get_user_model()

# ==========================================
# 🚀 CUSTOM JWT SERIALIZER (100% FIXED FOR CUSTOM USER MODEL)
# ==========================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Frontend ab dono bhej raha hai, humein bas email chahiye
        email_input = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if email_input and password:
            # 🛑 CRITICAL FIX: Only filter by email. DO NOT use username.
            user_obj = User.objects.filter(email=email_input).first()

            if user_obj:
                if user_obj.check_password(password):
                    self.user = user_obj
                    refresh = self.get_token(self.user)
                    data = {}
                    data['refresh'] = str(refresh)
                    data['access'] = str(refresh.access_token)

                    # Role Checking Logic using your actual database fields
                    if self.user.is_superuser:
                        data['role'] = "Super Admin"
                    else:
                        data['role'] = getattr(self.user, 'role', 'Student')
                        
                    # Name sending logic using your actual 'full_name' field
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
            # 🛑 Removed username from superuser creation
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
# ==========================================
# URL PATTERNS
# ==========================================
urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('setup-live-admin/', create_live_admin), 
    path("api/", include(router.urls)), 
    path("api/auth/", include("accounts.urls")), 
    path("api/dashboard/", include("dashboard.urls")),
    path("api/agents/", include("agents.urls")),
    path("api/logs/", include("logs.urls")),
    path("api/students/", include("students.urls")),
    path("api/teachers/", include("teachers.urls")),
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
    path('api/chat/', AIChatAPI.as_view()),
    
    # 🔥 YAHAN FIX KIYA HAI ('api/' add kiya hai) 👇
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)