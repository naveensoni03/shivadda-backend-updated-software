from django.db import models
from django.conf import settings
from institutions.models import Institution
import uuid

# 1. COURSE (Main Entity)
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="courses")
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    
    duration_months = models.IntegerField(default=12)
    fee_per_year = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

# 2. BATCH (For scheduling students)
class Batch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="batches")
    
    name = models.CharField(max_length=100, help_text="e.g. Morning Batch A")
    start_date = models.DateField()
    max_students = models.IntegerField(default=60)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.course.name}"

# 3. SUBJECTS (Physics, Math)
class Subject(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.name} ({self.course.name})"

# 4. LESSONS (Video/Text Content)
class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True, null=True)
    content = models.TextField(blank=True, help_text="Lesson notes or summary")
    
    order = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False) # Free demo lesson?

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

# 5. RESOURCES (PDFs, Files for lessons)
class Resource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    file_title = models.CharField(max_length=100)
    file = models.FileField(upload_to='course_resources/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_title

# 6. VIRTUAL CLASS (Live Zoom/Meet Links)
class VirtualClass(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="live_classes", null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    meeting_link = models.URLField()
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Live: {self.title} ({self.scheduled_at.strftime('%Y-%m-%d %H:%M')})"