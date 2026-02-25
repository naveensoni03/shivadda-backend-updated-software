from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter 

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from chatbot.views import AIChatAPI
from visitors.views import VisitorViewSet
from accounts.views import UserManagementViewSet

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet, basename='visitors')
router.register(r'users', UserManagementViewSet, basename='users')

# 🔥 SECRET FUNCTION: Live Server par Superuser banane ke liye
def create_live_admin(request):
    User = get_user_model()
    email = 'user2@gmail.com'
    password = 'user' 

    if not User.objects.filter(email=email).exists():
        try:
            user = User.objects.create_superuser(email=email, password=password)
            if hasattr(user, 'full_name'):
                user.full_name = 'Super Admin'
            elif hasattr(user, 'first_name'):
                user.first_name = 'Super'
            user.save()
            return HttpResponse(f"<h1>✅ Live Superuser Created!</h1><p><b>Email:</b> {email}</p><p><b>Password:</b> {password}</p><p>Ab aap Frontend par aaram se Login kar sakte hain! 🚀</p>")
        except Exception as e:
            return HttpResponse(f"<h1>❌ Error:</h1> <p>{e}</p>")
    else:
        return HttpResponse("<h1>⚠️ Superuser pehle se bana hua hai!</h1> <p>Aap sidhe frontend par login kar sakte hain.</p>")


def home(request):
    return HttpResponse("""
        <div style='text-align: center; padding-top: 50px; font-family: sans-serif;'>
            <h1>Backend Server is Running Successfully! 🚀</h1>
            <p>Go to <a href='/api/centers/' style='color: blue; font-weight: bold;'>View Exam Centers</a></p>
        </div>
    """)

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    # ✅ JWT LOGIN APIs
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 🔴 SECRET ADMIN CREATOR URL 
    path('setup-live-admin/', create_live_admin), 

    # ✅ MAIN API ROUTER
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
    
    path('api/chat/', AIChatAPI.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)