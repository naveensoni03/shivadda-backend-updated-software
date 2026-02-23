from rest_framework import serializers
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True, default="System")
    actor_email = serializers.CharField(source='actor.email', read_only=True)
    target = serializers.CharField(source='target_repr', read_only=True)

    class Meta:
        model = ActivityLog
        # ✅ Ab sabhi naye fields JSON response me frontend ko milenge
        fields = [
            'id', 'actor_name', 'actor_email', 'action_type', 'target', 'target_model', 
            'target_object_id', 'ip_address', 'details', 'timestamp',
            'user_type', 'group_id', 'subgroup_id', 'registration_status',
            'mobile', 'email', 'place_id', 'subplace_id', 'services_id',
            'latitude', 'longitude'
        ]