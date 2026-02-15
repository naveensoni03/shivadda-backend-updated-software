from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum

# ✅ Ek sath sab models import kar liye
from students.models import Student
from teachers.models import Teacher
from fees.models import FeeTransaction
from logs.models import ActivityLog

class DashboardStatsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # 1. Total Students
        try:
            student_count = Student.objects.count()
        except Exception:
            student_count = 0

        # 2. Total Teachers (Direct Database se 5 aayega)
        try:
            teacher_count = Teacher.objects.count()
        except Exception:
            teacher_count = 0

        # 3. Fees / Revenue (Direct Transactions se aayega)
        try:
            collected = FeeTransaction.objects.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
            pending = FeeTransaction.objects.aggregate(Sum('due_amount'))['due_amount__sum'] or 0
        except Exception:
            collected = 0
            pending = 0

        # 4. Recent Activities
        try:
            logs = ActivityLog.objects.all().order_by('-timestamp')[:4]
            activities = [
                {
                    "action_type": log.action_type,
                    "description": log.details or f"{log.action_type} action performed",
                    "timestamp": log.timestamp
                } for log in logs
            ]
        except Exception:
            activities = []

        # ✅ EK SATH SAARA DATA RETURN
        return Response({
            "students": student_count,
            "staff": teacher_count,
            "revenue": float(collected),
            "pending": float(pending),
            "activities": activities
        })