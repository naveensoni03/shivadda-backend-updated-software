from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ActivityLog
from .serializers import ActivityLogSerializer

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows activity logs to be viewed.
    Only allows GET requests (list, retrieve).
    """
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    # ✅ Search aur Filtering Enable ki
    filter_backends = [filters.SearchFilter]
    search_fields = ['actor__email', 'target_repr', 'action_type', 'details']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Filter by Action Type (Login, Update, etc.)
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        # ✅ FIXED: Safe check for role taaki system crash na ho agar 'role' field exist na kare
        user_role = getattr(user, 'role', None)
        if user_role == 'SUPER_ADMIN' or user.is_superuser:
            return queryset
        
        # Normal user sirf apna aur system (null) logs dekhega
        return queryset.filter(Q(actor=user) | Q(actor__isnull=True))


# ✅ ADDED FOR DASHBOARD: Ye view tumhare frontend ke React Dashboard ko real activity bhejega
class RecentActivityView(APIView):
    """
    Returns the 4 most recent activity logs for the dashboard.
    """
    permission_classes = [IsAuthenticated] 
    
    def get(self, request):
        try:
            user = request.user
            user_role = getattr(user, 'role', None)
            
            # Superadmin ko sabki activity dikhegi, baakiyon ko sirf apni
            if user_role == 'SUPER_ADMIN' or user.is_superuser:
                logs = ActivityLog.objects.all().order_by('-timestamp')[:4]
            else:
                logs = ActivityLog.objects.filter(Q(actor=user) | Q(actor__isnull=True)).order_by('-timestamp')[:4]

            data = [
                {
                    "action_type": log.action_type,
                    "description": log.details or f"{log.action_type} action performed",
                    "timestamp": log.timestamp
                } for log in logs
            ]
        except Exception as e:
            print(f"Error fetching recent activity: {e}")
            data = []
            
        return Response(data)