from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityLogViewSet, RecentActivityView

router = DefaultRouter()
router.register(r'', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    # DASHBOARD WIDGET URL 
    path('activity/recent/', RecentActivityView.as_view(), name='recent-activity'),
    # MAIN LOGS URLS
    path('', include(router.urls)),
]