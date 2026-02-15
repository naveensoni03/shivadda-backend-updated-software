from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Homework, HomeworkSubmission

class SubmitHomeworkAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        homeworks = Homework.objects.all()
        data = [{"id": h.id, "title": h.title, "description": h.description, "due_date": h.due_date} for h in homeworks]
        return Response(data)

    def post(self, request):
        return Response({"message": "Submission Successful"})