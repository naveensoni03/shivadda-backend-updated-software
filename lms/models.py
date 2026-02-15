from django.db import models
from django.conf import settings
from courses.models import Course
from batches.models import Batch

class Homework(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class HomeworkSubmission(models.Model):
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    teacher_remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.email} - {self.homework.title}"

# Communication System (PDF Point 44-45) [cite: 44, 45]
class Notice(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    target_role = models.CharField(
        max_length=20, 
        choices=(('ALL', 'All'), ('STUDENT', 'Students'), ('TEACHER', 'Teachers')), 
        default='ALL'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title