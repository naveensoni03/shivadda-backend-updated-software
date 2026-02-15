from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityLogViewSet, RecentActivityView

# ✅ Router setup for ViewSet (Ye saare normal logs /api/logs/ handle karega)
router = DefaultRouter()
router.register(r'', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    # ✅ DASHBOARD WIDGET URL (ISKO HAMESHA ROUTER SE UPAR RAKHNA HAI)
    # Taki '/api/logs/activity/recent/' sahi se hit ho
    path('activity/recent/', RecentActivityView.as_view(), name='recent-activity'),
    
    # ✅ MAIN LOGS URLS (Ye automatically List, Retrieve waghera bana dega)
    path('', include(router.urls)),
]