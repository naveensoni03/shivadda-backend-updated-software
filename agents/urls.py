from django.urls import path
from .views import AgentListCreate, AgentToggleStatus

urlpatterns = [
    path("", AgentListCreate.as_view()),
    path("<int:pk>/status/", AgentToggleStatus.as_view()),
]
