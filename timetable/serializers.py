from rest_framework import serializers
from .models import Schedule

class ScheduleSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    fullDay = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'day', 'fullDay', 'subject', 'teacher', 'room', 'time', 'color', 'is_break']

    def get_time(self, obj):
        return f"{obj.start_time.strftime('%I:%M %p')} - {obj.end_time.strftime('%I:%M %p')}"