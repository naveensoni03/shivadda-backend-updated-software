from rest_framework import viewsets
from rest_framework.response import Response
from .models import Schedule
from .serializers import ScheduleSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def list(self, request):
        # Format data exactly how React frontend expects it
        days_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        formatted_data = []

        for day_code in days_order:
            day_schedules = self.queryset.filter(day=day_code).order_by('start_time')
            if day_schedules.exists():
                serializer = self.serializer_class(day_schedules, many=True)
                formatted_data.append({
                    "day": day_code,
                    "fullDay": dict(Schedule.DAY_CHOICES).get(day_code),
                    "slots": serializer.data
                })

        return Response(formatted_data)