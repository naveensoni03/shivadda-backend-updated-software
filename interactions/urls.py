from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseReviewViewSet, DoubtViewSet, DoubtReplyViewSet

router = DefaultRouter()
router.register(r'reviews', CourseReviewViewSet)
router.register(r'doubts', DoubtViewSet)
router.register(r'replies', DoubtReplyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
