from django.urls import path
from .views import StudentListCreateView, StudentToggleStatus, student_count # ✅ Import student_count
from .views import StudentDashboardSummaryView

urlpatterns = [
    path('list/', StudentListCreateView.as_view(), name='student-list'),
    path('<int:pk>/status/', StudentToggleStatus.as_view()),
    
    # ✅ Add this NEW line
    path('count/', student_count, name='student-count'), 
    # 🔥 Yahan Dashboard API ka link add kar diya
    path('dashboard-summary/', StudentDashboardSummaryView.as_view(), name='student-dashboard-summary'),
]