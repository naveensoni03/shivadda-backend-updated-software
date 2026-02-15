from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter 

# Imports from Views
from chatbot.views import AIChatAPI
from visitors.views import VisitorViewSet
from accounts.views import UserManagementViewSet
# ✅ NOTE: logs import yahan se hata diya hai kyunki ab wo logs/urls.py me sambhala jayega

# ✅ Router Setup for Global ViewSets
router = DefaultRouter()
router.register(r'visitors', VisitorViewSet, basename='visitors')
router.register(r'users', UserManagementViewSet, basename='users')
# ✅ NOTE: logs router se hata diya gaya hai

# ✅ Home Page Function
def home(request):
    return HttpResponse("""
        <div style='text-align: center; padding-top: 50px; font-family: sans-serif;'>
            <h1>Backend Server is Running Successfully! 🚀</h1>
            <p>Go to <a href='/api/centers/' style='color: blue; font-weight: bold;'>View Exam Centers</a></p>
        </div>
    """)

urlpatterns = [
    # ✅ Main Home Page
    path("", home),

    # ✅ Admin Panel
    path("admin/", admin.site.urls),

    # ✅ MAIN API ROUTER
    path("api/", include(router.urls)), 

    # AUTH & CORE
    path("api/auth/", include("accounts.urls")), 
    path("api/dashboard/", include("dashboard.urls")),
    path("api/agents/", include("agents.urls")),
    path("api/logs/", include("logs.urls")), # ✅ ADDED: Naya logs urls directly include kiya hai

    # USERS & INSTITUTIONS
    path("api/students/", include("students.urls")),
    path("api/teachers/", include("teachers.urls")),
    path("api/institutions/", include("institutions.urls")),

    # MASTER DATA
    path('api/locations/', include('locations.urls')),
    path('api/centers/', include('centers.urls')),  # ✅ Exam Centers
    path('api/services/', include('services.urls')),

    # ACADEMIC & ENROLLMENTS
    path("api/courses/", include("courses.urls")),
    path("api/batches/", include("batches.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    
    # RESOURCES
    path("api/attendance/", include("attendance.urls")),
    path("api/fees/", include("fees.urls")),              
    path("api/exams/", include("exams.urls")),            
    path("api/lms/", include("lms.urls")),
    path("api/library/", include("library.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/hostel/", include("hostel.urls")),   
    path("api/transport/", include("transport.urls")), 
    path("api/payroll/", include("payroll.urls")),
    
    # CHATBOT
    path('api/chat/', AIChatAPI.as_view()),
]

# ✅ FIXED: Static Files Handling for CSS/JS in Debug Mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)