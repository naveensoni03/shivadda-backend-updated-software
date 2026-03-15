from rest_framework import serializers
from .models import Room, RoomAllocation, Hostel, HostelComplaint, GatePass

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

# Naye serializers add kiye gaye hain
class ComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    
    class Meta:
        model = HostelComplaint
        fields = '__all__'

class GatePassSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    
    class Meta:
        model = GatePass
        fields = '__all__'