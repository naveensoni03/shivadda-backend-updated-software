from rest_framework.permissions import BasePermission

class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        # ✨ NEW ADDED: Check for is_active to ensure Hibernated/Inactive users cannot access
        # ✨ NEW ADDED: Added 'SCHOOL_ADMIN' to the allowed roles list
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ["ADMIN", "SUPER_ADMIN", "SCHOOL_ADMIN"] 
        )