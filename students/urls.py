from django.urls import path
# ✅ StudentDetailView ko import kiya
from .views import StudentListCreateView, StudentDetailView, StudentToggleStatus, student_count
from .views import StudentDashboardSummaryView

urlpatterns = [
    path('list/', StudentListCreateView.as_view(), name='student-list'),
    
    # 🚀 YEH RAASTA MISSING THA UPDATE KE LIYE! 
    # Ab update ka rasta ban gaya hai: /api/students/detail/{id}/
    path('detail/<int:pk>/', StudentDetailView.as_view(), name='student-detail'), 
    
    path('<int:pk>/status/', StudentToggleStatus.as_view()),
    path('count/', student_count, name='student-count'), 
    path('dashboard-summary/', StudentDashboardSummaryView.as_view(), name='student-dashboard-summary'),
]