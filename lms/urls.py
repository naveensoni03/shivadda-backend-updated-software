from django.urls import path
from .views import HomeworkListAPI, HomeworkDetailAPI, HomeworkSubmissionsAPI

urlpatterns = [
    # Ye wahi routes hain jo React frontend fetch kar raha hai
    path('homework/', HomeworkListAPI.as_view(), name='homework-list'),
    path('homework/<int:pk>/', HomeworkDetailAPI.as_view(), name='homework-detail'),
    path('homework/<int:pk>/submissions/', HomeworkSubmissionsAPI.as_view(), name='homework-submissions'),
]