from rest_framework import serializers
from .models import Room, RoomAllocation, Hostel

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'