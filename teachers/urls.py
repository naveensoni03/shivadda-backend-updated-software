from django.urls import path
from .views import TeacherListCreateView, TeacherDetailView, teacher_count, department_stats

urlpatterns = [
    path('', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('count/', teacher_count, name='teacher-count'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher-detail'),
    
    # 🚀 NAYA RASTA (API) STATS KE LIYE
    path('department-stats/', department_stats, name='department-stats'),
]