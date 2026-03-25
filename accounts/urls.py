from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    me, MeView, 
    AgentListCreateView, AgentDetailView, 
    UserManagementViewSet,
    SendOTPView, VerifyOTPAndLoginView, 
    MyChildrenProfileView,
    MyChildrenProgressView,
    MyChildrenFeesView,
    MyChildrenExamsView,
    ParentSettingsView,  # 👈 Properly imported here
    CreateRazorpayOrderView
)

# Router Setup
router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='admin-users')

urlpatterns = [
    # ==========================================
    # 🔐 2-STEP OTP & LOGIN URLs
    # ==========================================
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("login/", VerifyOTPAndLoginView.as_view(), name="verify-login"),

    # JWT Authentication
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Agent URLs
    path("agents/", AgentListCreateView.as_view(), name="agent-list-create"),
    path("agents/<int:pk>/", AgentDetailView.as_view(), name="agent-detail"),
    path("me/", me, name="me"),

    # ==========================================
    # 👨‍👩‍👦 PARENT DASHBOARD URLs
    # ==========================================
    path("parents/profile/my_children/", MyChildrenProfileView.as_view(), name="parent-children"),
    path("parents/profile/progress/", MyChildrenProgressView.as_view(), name="parent-progress"),
    path("parents/profile/fees/", MyChildrenFeesView.as_view(), name="parent-fees"),
    path("parents/profile/exams/", MyChildrenExamsView.as_view(), name="parent-exams"),
    path("parents/profile/settings/", ParentSettingsView.as_view(), name="parent-settings"), # 👈 Safely added here

    # Razorpay Payment Order URL
    path("create-payment-order/", CreateRazorpayOrderView.as_view(), name="create-payment-order"),

    # Router URLs (For Users)
    path('', include(router.urls)),
]