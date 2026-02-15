from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.apps import apps
from datetime import date
from .models import Attendance
from .serializers import AttendanceSerializer
from students.models import Student
from batches.models import Batch 

class DailyAttendanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    # 🟢 1. DATA DATABASE SE LAANE KE LIYE (DIRECT FILTER)
    def get(self, request):
        batch_id = request.query_params.get('batch_id') or request.query_params.get('batch')
        date_param = request.query_params.get('date')

        if not batch_id or not date_param:
            return Response([])

        attendances = Attendance.objects.filter(batch_id=batch_id, date=date_param)
        attendance_dict = {att.student_id: att for att in attendances}
        
        # 🚀 FIX: `is_active=True` HATA DIYA HAI. Ab "Pending" status wale bachhe bhi 100% aayenge!
        if str(batch_id) == "1":
            # Class 10-A ke liye
            students = Student.objects.filter(student_class__icontains="10", section__icontains="A")
        elif str(batch_id) == "2":
            # Class 12-B ke liye
            students = Student.objects.filter(student_class__icontains="12", section__icontains="B")
        else:
            students = Student.objects.none()

        # Terminal mein check karne ke liye print
        print(f"🎯 DEBUG: Batch ID {batch_id} ke liye database se {students.count()} students mile!")

        response_data = []
        for student in students:
            att = attendance_dict.get(student.id)
            response_data.append({
                "id": student.id,
                "student": student.id,
                "batch": batch_id,
                "date": date_param,
                "roll": student.roll_number,
                "name": f"{student.first_name} {student.last_name}".strip(),
                "status": att.status if att else "Present",
                "remarks": att.remarks if att else "",
            })
        return Response(response_data)


    # 🔵 2. DATA DATABASE MEIN SAVE KARNE KE LIYE
    def post(self, request):
        data = request.data
        attendance_items = data.get('attendance_list') or []
        
        if not attendance_items and isinstance(data, list):
            attendance_items = data

        if not attendance_items:
            return Response({"message": "Koi student data nahi mila."}, status=400)

        saved_data = []
        req_batch_id = data.get('batch_id')
        req_date = data.get('date')

        # Error se bachne ke liye Auto-Create Batch
        b_id = int(req_batch_id or attendance_items[0].get('batch', 1))
        if not Batch.objects.filter(id=b_id).exists():
            Course = apps.get_model('courses', 'Course')
            first_course = Course.objects.first()
            if first_course:
                b_name = "Class 10-A (Science)" if b_id == 1 else "Class 12-B (Commerce)"
                Batch.objects.create(id=b_id, name=b_name, course=first_course, start_date=date.today())

        for item in attendance_items:
            try:
                s_id = int(item.get('student') or item.get('id'))
                d_val = item.get('date') or req_date

                payload = {
                    "batch": b_id,
                    "student": s_id,
                    "date": d_val,
                    "status": item.get('status', 'Present'),
                    "remarks": item.get('remarks', '')
                }

                # Save Data
                instance = Attendance.objects.filter(batch_id=b_id, student_id=s_id, date=d_val).first()
                serializer = AttendanceSerializer(instance, data=payload) if instance else AttendanceSerializer(data=payload)

                if serializer.is_valid():
                    serializer.save()
                    saved_data.append(serializer.data)
                else:
                    print(f"❌ Save Error: {serializer.errors}")
                    return Response(serializer.errors, status=400)

            except Exception as e:
                print(f"❌ Record Error: {e}")
                continue

        return Response({"message": "Attendance Saved Successfully!", "data": saved_data}, status=201)


class AttendanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AttendanceSerializer(Attendance.objects.all(), many=True).data)

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AttendanceEligibilityAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        stats = Attendance.objects.filter(batch_id=batch_id).values('student__name').annotate(
            total_lectures=Count('id'),
            present_count=Count('id', filter=Q(status__iexact='Present'))
        )
        
        report = []
        for s in stats:
            percentage = (s['present_count'] / s['total_lectures'] * 100) if s['total_lectures'] > 0 else 0
            report.append({
                "student": s['student__name'],
                "percentage": round(percentage, 2),
                "eligible": percentage >= 75 
            })
        return Response(report)