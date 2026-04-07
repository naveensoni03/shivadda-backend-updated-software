from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    MeView, # ✅ 'me' function ki jagah MeView class
    AgentListCreateView, AgentDetailView, 
    UserManagementViewSet,
    SendOTPView, VerifyOTPAndLoginView, 
    MyChildrenProfileView,
    MyChildrenProgressView,
    MyChildrenFeesView,
    MyChildrenExamsView,
    ParentSettingsView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView, # 🔥 YEH NAYA VERIFICATION VIEW IMPORT KIYA
    SuperAdminMasterGridView,
    ToggleUserOTPView,
    User360ViewAPI # 🔥 YEH NAYA 360 VIEW IMPORT KIYA
)

# Router Setup
router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='admin-users')

urlpatterns = [
    # 🔐 Auth URLs
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("login/", VerifyOTPAndLoginView.as_view(), name="verify-login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Agents
    path("agents/", AgentListCreateView.as_view(), name="agent-list-create"),
    path("agents/<int:pk>/", AgentDetailView.as_view(), name="agent-detail"),
    
    # ✅ Fixed here: Using MeView
    path("me/", MeView.as_view(), name="me"),

    # 👨‍👩‍👦 Parent Dashboard
    path("parents/profile/my_children/", MyChildrenProfileView.as_view(), name="parent-children"),
    path("parents/profile/progress/", MyChildrenProgressView.as_view(), name="parent-progress"),
    path("parents/profile/fees/", MyChildrenFeesView.as_view(), name="parent-fees"),
    path("parents/profile/exams/", MyChildrenExamsView.as_view(), name="parent-exams"),
    path("parents/profile/settings/", ParentSettingsView.as_view(), name="parent-settings"),

    # 💳 Payments (Razorpay)
    path("create-payment-order/", CreateRazorpayOrderView.as_view(), name="create-payment-order"),
    path("verify-payment/", VerifyRazorpayPaymentView.as_view(), name="verify-payment"), # 🔥 YEH NAYA VERIFICATION ROUTE ADD KIYA
    
    # 👑 Super Admin Dashboard APIs
    path("superadmin/master-grid/", SuperAdminMasterGridView.as_view(), name="master-grid"),
    path("users/<int:pk>/", ToggleUserOTPView.as_view(), name="toggle-user-otp"),
    path("users/<int:pk>/360-view/", User360ViewAPI.as_view(), name="user-360-view"), # 🔥 YEH NAYA ROUTE ADD KIYA

    path('', include(router.urls)),
]