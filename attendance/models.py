from django.db import models
from batches.models import Batch
from students.models import Student

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    )

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="attendance_records")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendances")
    date = models.DateField(db_index=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['batch', 'student', 'date'], name='unique_daily_attendance')
        ]
        verbose_name_plural = "Attendance Records"
        ordering = ['-date', 'student']

    def __str__(self):
        student_name = getattr(self.student, 'first_name', getattr(self.student, 'name', f"Student-{self.student.id}"))
        if hasattr(self.student, 'last_name') and self.student.last_name:
            student_name += f" {self.student.last_name}"
        return f"{student_name.strip()} - {self.date} - {self.status}"