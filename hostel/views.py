from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Room, RoomAllocation, Hostel
from .serializers import RoomSerializer # Serializer bana lena (basic ModelSerializer)
from students.models import Student

class AllocateRoomAPI(APIView):
    def post(self, request):
        try:
            student_id = request.data.get('student_id')
            room_id = request.data.get('room_id')

            student = Student.objects.get(id=student_id)
            room = Room.objects.get(id=room_id)

            if room.current_occupancy >= room.capacity:
                return Response({"error": "Room is Full!"}, status=400)

            # Allocation create karte hi Signal trigger hoga aur Fees jud jayegi
            allocation = RoomAllocation.objects.create(student=student, room=room)

            return Response({"message": "Room Allocated & Fee Invoice Generated!"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)