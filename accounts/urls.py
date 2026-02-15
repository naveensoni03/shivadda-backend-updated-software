from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    me, MeView, 
    AgentListCreateView, AgentDetailView, 
    UserManagementViewSet
)

# Router Setup
router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='admin-users')

urlpatterns = [
    # JWT Authentication
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Agent URLs
    path("agents/", AgentListCreateView.as_view(), name="agent-list-create"),
    path("agents/<int:pk>/", AgentDetailView.as_view(), name="agent-detail"),
    path("me/", me, name="me"), 

    # Router URLs (For Users)
    path('', include(router.urls)),
]