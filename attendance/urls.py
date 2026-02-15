from django.urls import path
from .views import AttendanceAPI, AttendanceEligibilityAPI, DailyAttendanceAPI

urlpatterns = [
    path("", AttendanceAPI.as_view()),
    # ✅ NAYA PATH: Ye aapke React frontend ki request catch karega aur 400 Error khatam karega
    path("daily/", DailyAttendanceAPI.as_view()), 
    path("eligibility/<int:batch_id>/", AttendanceEligibilityAPI.as_view()), 
]