from django.db import models
from courses.models import Course
from students.models import Student

class Batch(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # 🔥 NAYI LINE: WhatsApp Group Link ke liye (Req 5)
    whatsapp_group_link = models.URLField(max_length=500, blank=True, null=True, help_text="Paste WhatsApp Invite Link here")

    def __str__(self):
        return self.name