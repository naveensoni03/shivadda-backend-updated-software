from django.urls import path
from .views import EnrollmentListCreate, EnrollmentDetail

urlpatterns = [
    path('', EnrollmentListCreate.as_view()),
    path('<uuid:pk>/', EnrollmentDetail.as_view()), # 🚀 YAHAN FIX HAI: 'int' ko hata kar 'uuid' kar diya!
]