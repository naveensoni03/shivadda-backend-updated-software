from rest_framework import serializers
from .models import Institution
from locations.serializers import PlaceSerializer

class InstitutionSerializer(serializers.ModelSerializer):
    place_details = PlaceSerializer(source='place', read_only=True)
    
    # ✅ Frontend uses 'phone', 'address' explicitly in their payload, 
    # we need to map them to model fields if they differ
    phone = serializers.CharField(source='contact_phone', required=False)
    address = serializers.CharField(source='address_details', required=False)

    class Meta:
        model = Institution
        fields = [
            'id', 
            'virtual_id', 
            'name', 
            'institution_code', 
            'principal_name', 
            'contact_email', 
            'contact_phone', 'phone', # mapped
            'website',
            'management_type', # ✅ NEW
            'place',
            'place_details',
            'address_details', 'address', # mapped
            # ✅ NEW LOCATION FIELDS
            'district', 'state', 'pin_code', 'latitude', 'longitude',
            'service_type', 
            'service_mode', 
            'levels', 
            'place_code', # ✅ NEW (Category)
            # ✅ NEW FACILITIES
            'has_library', 'has_hostel', 'has_transport', 'has_security', 'tech_used',
            'subscription_plan', 
            'plan_expiry_date',
            'created_at',
            'is_active'
        ]
        read_only_fields = ['virtual_id', 'plan_expiry_date', 'created_at']

    # Optional: Handle explicit saving if needed for aliased fields
    def create(self, validated_data):
        # Extract aliased fields mapped by 'source' if they are sent explicitly. 
        # DRF usually handles 'source' mapping automatically.
        return super().create(validated_data)