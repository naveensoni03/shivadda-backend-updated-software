import logging
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ActivityLog
from .serializers import ActivityLogSerializer

logger = logging.getLogger(__name__)

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows activity logs to be viewed by Frontend React.
    """
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['actor__email', 'target_repr', 'action_type', 'details', 'mobile', 'place_id']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        user_role = getattr(user, 'role', None)
        if user_role == 'SUPER_ADMIN' or user.is_superuser:
            return queryset
        
        return queryset.filter(Q(actor=user) | Q(actor__isnull=True))


class RecentActivityView(APIView):
    """
    Returns the 4 most recent activity logs for dashboard previews.
    """
    permission_classes = [IsAuthenticated] 
    
    def get(self, request):
        try:
            user = request.user
            user_role = getattr(user, 'role', None)
            
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
            logger.error(f"Error fetching recent activity: {e}")
            data = []
            
        return Response(data)


def log_action(user, action_type, target_repr, target_model="System", details="", request=None, **kwargs):
    """
    Universal Log Helper updated with Geography and User Types
    """
    ip = '127.0.0.1'
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')

    actor = user if (user and hasattr(user, 'is_authenticated') and user.is_authenticated) else None

    try:
        ActivityLog.objects.create(
            actor=actor,
            action_type=action_type,
            target_model=target_model,
            target_repr=str(target_repr),
            details=details,
            ip_address=ip,
            # ✅ Extracted kwargs for dynamic requirements
            user_type=kwargs.get('user_type', getattr(actor, 'role', 'GUEST') if actor else 'SYSTEM'),
            mobile=kwargs.get('mobile', getattr(actor, 'mobile', None) if actor else None),
            email=kwargs.get('email', actor.email if actor else None),
            place_id=kwargs.get('place_id'),
            subplace_id=kwargs.get('subplace_id'),
            services_id=kwargs.get('services_id'),
            latitude=kwargs.get('latitude'),
            longitude=kwargs.get('longitude'),
            group_id=kwargs.get('group_id'),
            subgroup_id=kwargs.get('subgroup_id'),
            registration_status=kwargs.get('registration_status', 'REGISTERED' if actor else 'NON-REGISTERED')
        )
    except Exception as e:
        logger.error(f"Failed to create ActivityLog for {action_type}: {e}")