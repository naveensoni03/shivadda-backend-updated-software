from django.urls import path
from .views import DashboardStatsAPIView

urlpatterns = [
    # Master route for all dashboard data
    path('stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
]