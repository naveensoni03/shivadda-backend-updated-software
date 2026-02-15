from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import ExamCenter
from .serializers import ExamCenterSerializer

class ExamCenterViewSet(viewsets.ModelViewSet):
    queryset = ExamCenter.objects.all().order_by('-created_at')
    serializer_class = ExamCenterSerializer