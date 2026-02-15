from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from .models import Agent
from .serializers import AgentSerializer, AgentCreateSerializer, UserManagementSerializer
from .permissions import IsAdminOrSuperAdmin

# ✅ Helper Import for Audit Logs
from logs.utils import log_action 

User = get_user_model()

# ==========================================
# 🚀 SUPER ADMIN: USER MANAGEMENT
# ==========================================

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD for Users + Status Management (Active/Hibernate) + Logs
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserManagementSerializer
    permission_classes = [AllowAny] # Testing ke liye Open, Production me IsAdminUser karein
    
    # ✅ Search & Filter
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'full_name', 'phone']

    def perform_create(self, serializer):
        # Audit: Who created this user?
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    # ✅ NEW: Hibernate/Activate Status Toggle
    @action(detail=True, methods=['patch'])
    # ✅ NEW: Hibernate/Activate Status Toggle
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        user = self.get_object()
        new_status = request.data.get('status') # Expect: 'ACTIVE', 'INACTIVE', 'HIBERNATE'

        if new_status not in ['ACTIVE', 'INACTIVE', 'HIBERNATE']:
            return Response({"error": "Invalid Status"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = user.account_status
        user.account_status = new_status
        user.save() # Model ka save() method is_active ko auto-sync karega
        
        # 🚀 FIX: `target_repr` add kar diya gaya hai.
        try:
            log_action(
                user=request.user, 
                action_type='HIBERNATE' if new_status == 'HIBERNATE' else 'UPDATE',
                target_repr=user.email,  # <-- Added missing argument
                details=f"Changed account status from {old_status} to {new_status}",
                request=request
            )
        except Exception as e:
            print(f"⚠️ Audit Log Error (Ignored): {e}")
        
        return Response({
            "message": f"User marked as {new_status}",
            "account_status": user.account_status,
            "is_active": user.is_active
        })


# ==========================================
# 🛑 OLD CODE: AGENTS & ME (Kept As Is)
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "email": request.user.email,
        "role": request.user.role,
        "name": request.user.full_name
    })

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "email": request.user.email,
            "role": request.user.role,
            "name": request.user.full_name
        })

class AgentListCreateView(ListCreateAPIView):
    queryset = Agent.objects.select_related("user").all()
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AgentCreateSerializer
        return AgentSerializer

class AgentDetailView(RetrieveUpdateAPIView):
    queryset = Agent.objects.select_related("user").all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]