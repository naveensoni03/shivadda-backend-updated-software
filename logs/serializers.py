from rest_framework import serializers
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)
    actor_email = serializers.CharField(source='actor.email', read_only=True)
    
    # UI 'target' dhund raha hai, hum model ka 'target_repr' bhejenge
    target = serializers.CharField(source='target_repr', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'actor_name', 'actor_email', 'action_type', 'target', 'ip_address', 'details', 'timestamp']