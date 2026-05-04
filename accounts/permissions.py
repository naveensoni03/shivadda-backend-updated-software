from rest_framework.permissions import BasePermission, SAFE_METHODS

# ----------------------------------------------------------------
# 1. MANAGEMENT LEVEL PERMISSIONS (आपने जो लिखा था)
# ----------------------------------------------------------------
class IsAdminOrSuperAdmin(BasePermission):
    """सिर्फ Super Admin, Admin और School Admin के लिए"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ["ADMIN", "SUPER_ADMIN", "SCHOOL_ADMIN"] 
        )

# ----------------------------------------------------------------
# 2. PORTFOLIO / ACADEMIC STAFF PERMISSIONS
# ----------------------------------------------------------------
class IsTeacherOrHOD(BasePermission):
    """सिर्फ Teachers और HODs के लिए"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ["HOD", "TEACHER"]
        )

# ----------------------------------------------------------------
# 3. SERVICE SEEKERS (Students & Parents)
# ----------------------------------------------------------------
class IsServiceSeeker(BasePermission):
    """सिर्फ Students और Parents के लिए"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ["STUDENT", "PARENT"]
        )

# ----------------------------------------------------------------
# 4. 🔥 THE CORE EDITOR ARCHITECTURE (सबसे इम्पोर्टेन्ट)
# ----------------------------------------------------------------
class RoleBasedEditorPermission(BasePermission):
    """
    यह परमिशन तय करेगी कि कौन डेटा को ADD, UPDATE या DELETE कर सकता है।
    - Management: सब कुछ कर सकते हैं (GET, POST, PUT, DELETE)
    - Teachers/HOD: सिर्फ डेटा देख, जोड़ और अपडेट कर सकते हैं (GET, POST, PUT/PATCH) - DELETE बैन है!
    - Students/Parents/Security: सिर्फ अपना डेटा देख सकते हैं (GET Only - Read Only)
    """
    def has_permission(self, request, view):
        # सबसे पहले चेक करें कि यूज़र लॉगिन है और एक्टिव है
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False

        user_role = request.user.role

        # 1. Management को फुल पावर (Delete समेत)
        if user_role in ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN"]:
            return True

        # 2. SAFE_METHODS (GET, HEAD, OPTIONS) - 'View' करने की परमिशन सबको है (Read Only)
        if request.method in SAFE_METHODS:
            return True

        # 3. HOD & Teachers की पावर (Create & Update YES, Delete NO)
        if user_role in ["HOD", "TEACHER"]:
            # टीचर डेटा डिलीट नहीं कर सकता!
            if request.method == "DELETE":
                return False 
            return True # POST, PUT, PATCH allowed

        # 4. बाकी रोल्स (Student, Parent, Guard) API के ज़रिए ग्लोबल डेटा नहीं बदल सकते
        return False

# ----------------------------------------------------------------
# 5. OBJECT LEVEL PERMISSION (खुद का डेटा एक्सेस करने के लिए)
# ----------------------------------------------------------------
class IsOwnerOrAdmin(BasePermission):
    """
    यूज़र सिर्फ अपना डेटा अपडेट कर सकता है (जैसे प्रोफाइल फोटो)। 
    अगर वो एडमिन है, तो किसी का भी कर सकता है।
    """
    def has_object_permission(self, request, view, obj):
        # एडमिन को फुल एक्सेस
        if request.user.role in ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN"]:
            return True
        # अगर डेटा उसी यूज़र का है, तो एक्सेस दो
        # (यह मानकर कि obj खुद User मॉडल है या उसमें user field है)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user