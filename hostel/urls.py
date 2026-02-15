from django.urls import path
from .views import AllocateRoomAPI

urlpatterns = [
    path('allocate/', AllocateRoomAPI.as_view()),
]