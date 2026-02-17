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

    # 🟢 1. DATA DATABASE SE LAANE KE LIYE
    def get(self, request):
        batch_id = request.query_params.get('batch_id') or request.query_params.get('batch')
        date_param = request.query_params.get('date')

        if not batch_id or not date_param:
            return Response([])

        attendances = Attendance.objects.filter(batch_id=batch_id, date=date_param)
        attendance_dict = {att.student_id: att for att in attendances}
        
        # 🚀 FIX: `is_active=True` HATA DIYA HAI. Ab "Pending" status wale bachhe bhi aayenge!
        if str(batch_id) == "1":
            students = Student.objects.filter(student_class__icontains="10", section__icontains="A")
        elif str(batch_id) == "2":
            students = Student.objects.filter(student_class__icontains="12", section__icontains="B")
        else:
            students = Student.objects.none()

        print(f"🎯 DEBUG: Batch ID {batch_id} ke liye database se {students.count()} students mile!")

        response_data = []
        for student in students:
            att = attendance_dict.get(student.id)
            
            # ✅ SAFELY GETTING NAME (Crash prevent karne ke liye)
            f_name = getattr(student, 'first_name', getattr(student, 'name', f"Student-{student.id}"))
            l_name = getattr(student, 'last_name', '')
            full_name = f"{f_name} {l_name}".strip()
            
            # ✅ SAFELY GETTING ROLL NUMBER
            roll_no = getattr(student, 'roll_number', getattr(student, 'roll_no', 'N/A'))

            response_data.append({
                "id": student.id,
                "student": student.id,
                "batch": batch_id,
                "date": date_param,
                "roll": roll_no,
                "name": full_name,
                "status": att.status if att else "Present",
                "remarks": att.remarks if att else "",
            })
        return Response(response_data)


    # 🔵 2. DATA DATABASE MEIN SAVE KARNE KE LIYE (No changes needed here, it was correct)
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
        try:
            # 1. Bina kisi complex query ke seedha data nikal rahe hain
            attendances = Attendance.objects.filter(batch_id=batch_id).select_related('student')
            
            student_stats = {}
            
            # 2. Python loop ke andar calculation (Crash Proof)
            for att in attendances:
                try:
                    student = att.student
                    s_id = student.id
                except AttributeError:
                    continue # Agar kisi record mein student delete ho gaya ho toh skip karega
                    
                if s_id not in student_stats:
                    f_name = getattr(student, 'first_name', getattr(student, 'name', f"Student-{s_id}"))
                    l_name = getattr(student, 'last_name', '')
                    full_name = f"{f_name} {l_name}".strip()
                    
                    student_stats[s_id] = {
                        "name": full_name,
                        "total": 0,
                        "present": 0
                    }
                
                # Lectures count update
                student_stats[s_id]["total"] += 1
                if att.status and att.status.lower() == 'present':
                    student_stats[s_id]["present"] += 1

            # 3. Final Report tayyar karna
            report = []
            for s_id, data in student_stats.items():
                percentage = (data["present"] / data["total"] * 100) if data["total"] > 0 else 0
                report.append({
                    "student": data["name"],
                    "percentage": round(percentage, 2),
                    "eligible": percentage >= 75 
                })
                
            return Response(report)
            
        except Exception as e:
            print(f"🔥 Eligibility API Crash Error: {e}")
            # Agar phir bhi kuch fail hua, toh UI crash nahi hoga
            return Response([], status=200)