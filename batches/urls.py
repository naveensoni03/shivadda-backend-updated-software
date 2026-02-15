from django.urls import path
from .views import BatchListCreate

urlpatterns = [
    path("", BatchListCreate.as_view()),
]
