from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Homework, HomeworkSubmission, Notice
from courses.models import Course
from batches.models import Batch

User = get_user_model()

# ==========================================
# 1. HOMEWORK LIST & CREATE API
# ==========================================
class HomeworkListAPI(APIView):
    permission_classes = [AllowAny] # Abhi testing ke liye AllowAny rakha hai

    def get(self, request):
        homeworks = Homework.objects.all().order_by('-created_at')
        data = []
        for h in homeworks:
            # Safely fetching Course and Batch names
            subject_name = h.course.name if hasattr(h, 'course') and h.course else "General"
            class_name = h.batch.name if hasattr(h, 'batch') and h.batch else "All Classes"
            
            # Count real submissions
            sub_count = HomeworkSubmission.objects.filter(homework=h).count()

            data.append({
                "id": h.id,
                "title": h.title,
                "subject": subject_name,
                "class": class_name,
                "deadline": h.due_date.strftime("%Y-%m-%d") if h.due_date else "",
                "description": h.description,
                "status": getattr(h, 'status', 'Active'), # Agar model me status nahi hai to default 'Active'
                "submissions": sub_count,
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        
        # Frontend 'subject' aur 'target_class' text bhejta hai. 
        # Hum DB me real Course aur Batch dhoondhenge, nahi mila to pehla wala use karenge.
        course = Course.objects.filter(name__icontains=data.get('subject', '')).first() or Course.objects.first()
        batch = Batch.objects.filter(name__icontains=data.get('target_class', '')).first() or Batch.objects.first()
        teacher = request.user if request.user.is_authenticated else User.objects.filter(is_staff=True).first()

        try:
            hw = Homework.objects.create(
                title=data.get('title', 'Untitled'),
                description=data.get('description', ''),
                due_date=data.get('deadline') or timezone.now(),
                course=course,
                batch=batch,
                teacher=teacher
            )
            
            # Agar tumne model me status field add ki hai:
            if hasattr(hw, 'status'):
                hw.status = data.get('status', 'Active')
                hw.save()

            return Response({"message": "Homework Assigned Successfully!", "id": hw.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 2. HOMEWORK DETAIL (CLOSE TASK) API
# ==========================================
class HomeworkDetailAPI(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        hw = get_object_or_404(Homework, pk=pk)
        
        # Agar tumne models.py me status field banai hai toh update hoga
        if hasattr(hw, 'status'):
            hw.status = request.data.get('status', hw.status)
            hw.save()
            return Response({"message": "Task Closed successfully!"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Status update bypassed (Field not in model)"}, status=status.HTTP_200_OK)


# ==========================================
# 3. HOMEWORK SUBMISSIONS API (For "View Submissions" Button)
# ==========================================
class HomeworkSubmissionsAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        submissions = HomeworkSubmission.objects.filter(homework_id=pk).order_by('-submitted_at')
        data = []
        
        for sub in submissions:
            # Get Student Name securely
            student_name = "Student"
            if hasattr(sub.student, 'first_name'):
                student_name = f"{sub.student.first_name} {getattr(sub.student, 'last_name', '')}".strip()
            elif hasattr(sub.student, 'full_name'):
                student_name = sub.student.full_name
            elif hasattr(sub.student, 'username'):
                student_name = sub.student.username

            data.append({
                "id": sub.id,
                "student_name": student_name or sub.student.email,
                "date": sub.submitted_at.strftime("%b %d, %I:%M %p"), # format: Dec 21, 10:30 AM
                "status": "Late" if sub.is_late else "On Time",
                "score": sub.teacher_remarks if sub.teacher_remarks else "Pending"
            })
            
        return Response(data, status=status.HTTP_200_OK)