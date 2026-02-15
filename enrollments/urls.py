from django.urls import path
from .views import EnrollmentListCreate, EnrollmentDetail

urlpatterns = [
    path('', EnrollmentListCreate.as_view()),
    path('<int:pk>/', EnrollmentDetail.as_view()), # 🚀 YAHAN FIX HAI: ID ke through Delete karne ka rasta
]