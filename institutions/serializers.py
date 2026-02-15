from rest_framework import serializers
from .models import Institution
# ✅ Place Serializer Import
from locations.serializers import PlaceSerializer

class InstitutionSerializer(serializers.ModelSerializer):
    # ✅ Nested Serializer: Frontend par Place ka Pura Detail (Name, Hierarchy Code) dikhega
    place_details = PlaceSerializer(source='place', read_only=True)

    class Meta:
        model = Institution
        fields = [
            'id', 
            'virtual_id', 
            'name', 
            'institution_code', 
            'principal_name', 
            'contact_email', 
            'contact_phone', 
            'website',
            'place',           # Write ke liye (Place ID bhejni hai)
            'place_details',   # Read ke liye (Object milega)
            'address_details',
            'service_type', 
            'service_mode', 
            'levels', 
            'subscription_plan', 
            'plan_expiry_date',
            'created_at',
            'is_active'
        ]
        read_only_fields = ['virtual_id', 'plan_expiry_date', 'created_at']