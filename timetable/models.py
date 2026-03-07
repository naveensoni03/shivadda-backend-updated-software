from django.db import models
from courses.models import Course # Agar Course model hai
from django.contrib.auth import get_user_model

User = get_user_model()

class Schedule(models.Model):
    DAY_CHOICES = [
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
        ('Sat', 'Saturday'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="schedules", null=True, blank=True)
    # ✅ SAHI CODE (max_length use karna hai):
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    subject = models.CharField(max_length=100)
    teacher = models.CharField(max_length=100)
    room = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    color = models.CharField(max_length=20, default='blue')
    is_break = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.subject} on {self.get_day_display()} at {self.start_time}"