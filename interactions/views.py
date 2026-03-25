from rest_framework import viewsets
from .models import CourseReview, Doubt, DoubtReply
from .serializers import CourseReviewSerializer, DoubtSerializer, DoubtReplySerializer

class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer

class DoubtViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = DoubtSerializer

class DoubtReplyViewSet(viewsets.ModelViewSet):
    queryset = DoubtReply.objects.all()
    serializer_class = DoubtReplySerializer
