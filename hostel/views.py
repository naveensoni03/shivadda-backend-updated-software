from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Room, RoomAllocation, Hostel, HostelComplaint, GatePass
from .serializers import RoomSerializer, ComplaintSerializer, GatePassSerializer
from students.models import Student


# --- API 1: Allocate Room ---
class AllocateRoomAPI(APIView):
    def post(self, request):
        try:
            student_id = request.data.get('student_id')
            room_id = request.data.get('room_id')

            student = Student.objects.get(id=student_id)
            room = Room.objects.get(id=room_id)

            if room.current_occupancy >= room.capacity:
                return Response({"error": "Room is Full!"}, status=400)

            # Allocation create karte hi Signal trigger hoga (fees.models wahi rahega)
            RoomAllocation.objects.create(student=student, room=room)

            return Response({"message": "Room Allocated Successfully!"}, status=status.HTTP_201_CREATED)
        except Student.DoesNotExist:
             return Response({"error": "Student not found"}, status=404)
        except Room.DoesNotExist:
             return Response({"error": "Room not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# --- API 2: List Rooms (With Occupant Names) ---
class RoomListAPI(APIView):
    def get(self, request):
        block_name = request.query_params.get('block', None)
        if block_name:
            rooms = Room.objects.filter(hostel__name__icontains=block_name)
        else:
            rooms = Room.objects.all()
        
        serializer = RoomSerializer(rooms, many=True)
        data = serializer.data
        
        for room_data in data:
            allocations = RoomAllocation.objects.filter(room_id=room_data['id'], is_active=True)
            occupant_names = [{"name": f"{alloc.student.first_name} {alloc.student.last_name or ''}"} for alloc in allocations]
            room_data['occupants'] = occupant_names
            room_data['status'] = 'Full' if room_data['current_occupancy'] >= room_data['capacity'] else 'Available'
            
        return Response(data, status=status.HTTP_200_OK)


# --- API 3: List Unallocated Students ---
class UnallocatedStudentsAPI(APIView):
    def get(self, request):
        # Asli Database se wahi bachche laayenge jinka room nahi hai
        allocated_student_ids = RoomAllocation.objects.filter(is_active=True).values_list('student_id', flat=True)
        unallocated_students = Student.objects.exclude(id__in=allocated_student_ids)
        
        data = [{"id": s.id, "name": f"{s.first_name} {s.last_name or ''} ({s.student_class})"} for s in unallocated_students]
        return Response(data, status=status.HTTP_200_OK)


# --- 🚀 NEW REAL APIs FOR COMPLAINTS & GATE PASS 🚀 ---

# API 4: Manage Complaints
class ComplaintListAPI(APIView):
    def get(self, request):
        block_name = request.query_params.get('block', None)
        # Assuming we filter by block via Room relationship
        if block_name:
            complaints = HostelComplaint.objects.filter(room__hostel__name__icontains=block_name)
        else:
            complaints = HostelComplaint.objects.all()
            
        serializer = ComplaintSerializer(complaints, many=True)
        # Map fields to match Frontend expectations
        mapped_data = [
            {
                "id": c["id"],
                "student": f"{c['student_name']} ({c['room_number']})",
                "issue": c["issue"],
                "status": c["status"],
                "date": c["date_filed"]
            } for c in serializer.data
        ]
        return Response(mapped_data, status=status.HTTP_200_OK)
        
    def patch(self, request, pk=None):
        # This handles the "Resolve" button click
        complaint = get_object_or_404(HostelComplaint, pk=pk)
        complaint.status = request.data.get('status', 'Resolved')
        complaint.save()
        return Response({"message": "Complaint Updated"}, status=status.HTTP_200_OK)


# API 5: Manage Gate Passes
class GatePassListAPI(APIView):
    def get(self, request):
        block_name = request.query_params.get('block', None)
        if block_name:
            passes = GatePass.objects.filter(room__hostel__name__icontains=block_name)
        else:
            passes = GatePass.objects.all()
            
        serializer = GatePassSerializer(passes, many=True)
        # Map fields for Frontend
        mapped_data = [
            {
                "id": p["id"],
                "student": p['student_name'],
                "room_id": p['room_number'],
                "reason": p["reason"],
                "outTime": p["out_time"][:16].replace('T', ' '), # Format slightly for UI
                "status": p["status"]
            } for p in serializer.data
        ]
        return Response(mapped_data, status=status.HTTP_200_OK)
        
    def patch(self, request, pk=None):
        # This handles the "Approve" button click
        gatepass = get_object_or_404(GatePass, pk=pk)
        gatepass.status = request.data.get('status', 'Approved')
        gatepass.save()
        return Response({"message": "Gate Pass Updated"}, status=status.HTTP_200_OK)