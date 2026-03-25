from django.urls import path
from .views import StudentProfileAPI, MyMegaProfileAPI, AdminUserMegaProfileAPI

urlpatterns = [
    # Old Route
    path("", StudentProfileAPI.as_view(), name="student-profile-old"),

    # For Logged-in User (Self)
    path("me/", MyMegaProfileAPI.as_view(), name="my-mega-profile"),
    
    # 🚀 NEW: For Admin to View/Edit ANY User by ID
    path("admin/<int:user_id>/", AdminUserMegaProfileAPI.as_view(), name="admin-mega-profile"),
]