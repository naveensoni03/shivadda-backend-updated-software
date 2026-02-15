from django.urls import path
from .views import StudentProfileAPI

urlpatterns = [
    path("", StudentProfileAPI.as_view()),
]
