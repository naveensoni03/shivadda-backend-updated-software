from django.urls import path
from .views import (
    TeacherListCreateView, 
    TeacherDetailView, 
    teacher_count, 
    department_stats,
    StudyMaterialListCreate,  
    StudyMaterialDetail,
    TeacherStudentsAPI,        
    SendMessageAPI,
    TeacherMailboxAPI,
    TeacherMailboxDetailAPI,
    TeacherProfileAPI,
    TeacherChangePasswordAPI,
    TeacherDashboardStatsAPI
)

urlpatterns = [
    # 🚀 FIXED PATHS (Sabse Upar Rakho) 🚀
    path('dashboard-stats/', TeacherDashboardStatsAPI.as_view(), name='teacher-dashboard-stats'),
    path('count/', teacher_count, name='teacher-count'),
    path('department-stats/', department_stats, name='department-stats'),
    path('my-students/', TeacherStudentsAPI.as_view(), name='teacher-my-students'),
    path('materials/', StudyMaterialListCreate.as_view(), name='material-list-create'),
    path('send-message/', SendMessageAPI.as_view(), name='send-message'),
    path('mailbox/', TeacherMailboxAPI.as_view(), name='teacher-mailbox'),
    path('me/', TeacherProfileAPI.as_view(), name='teacher-me'),
    path('change-password/', TeacherChangePasswordAPI.as_view(), name='teacher-change-password'),

    # 🛑 VARIABLE/BLANK PATHS (Sabse Neeche Rakho) 🛑
    path('', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher-detail'),
    path('materials/<int:pk>/', StudyMaterialDetail.as_view(), name='material-detail'),
    path('mailbox/<int:pk>/', TeacherMailboxDetailAPI.as_view(), name='teacher-mailbox-detail'),
]