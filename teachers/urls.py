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
    # 🔥 NAYA IMPORT: Mailbox ke liye
    TeacherMailboxAPI,
    TeacherMailboxDetailAPI,
    TeacherProfileAPI,
    TeacherChangePasswordAPI,
    TeacherDashboardStatsAPI
)

urlpatterns = [
    # --- TEACHER ROUTES ---
    path('', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('count/', teacher_count, name='teacher-count'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher-detail'),
    path('department-stats/', department_stats, name='department-stats'),
    
    # --- 🚀 MY STUDENTS ROUTE ---
    path('my-students/', TeacherStudentsAPI.as_view(), name='teacher-my-students'),
    
    # --- STUDY MATERIAL ROUTES ---
    path('materials/', StudyMaterialListCreate.as_view(), name='material-list-create'),
    path('materials/<int:pk>/', StudyMaterialDetail.as_view(), name='material-detail'),
    path('send-message/', SendMessageAPI.as_view(), name='send-message'),

    # ==========================================
    # 🔥 NAYA: TEACHER MAILBOX ROUTES
    # ==========================================
    path('mailbox/', TeacherMailboxAPI.as_view(), name='teacher-mailbox'),
    path('mailbox/<int:pk>/', TeacherMailboxDetailAPI.as_view(), name='teacher-mailbox-detail'),
    
    path('me/', TeacherProfileAPI.as_view(), name='teacher-me'),
    path('change-password/', TeacherChangePasswordAPI.as_view(), name='teacher-change-password'),
    path('dashboard-stats/', TeacherDashboardStatsAPI.as_view(), name='teacher-dashboard-stats'),
    
]