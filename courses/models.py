from django.db import models
from django.conf import settings
from institutions.models import Institution
import uuid

# ==========================================
# 🛑 OLD SYSTEM (COURSES, BATCHES, LESSONS)
# ==========================================

# 1. COURSE (Main Entity)
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="courses")
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    
    # 🔥 NAYA: UNIVERSAL SELECTION (HIERARCHY) FIELDS 🔥
    state = models.CharField(max_length=100, blank=True, null=True)
    place_id = models.CharField(max_length=50, blank=True, null=True)
    service_id = models.CharField(max_length=50, blank=True, null=True)
    student_class = models.CharField(max_length=50, blank=True, null=True)
    # -------------------------------------------------

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
    is_preview = models.BooleanField(default=False)

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
    
class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress_records')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} - {'Done' if self.is_completed else 'Pending'}"


# ==========================================
# 🚀 NEW SYSTEM: PHASE 2 HIERARCHY ENGINE
# (Based on Client's Exact Document Needs)
# ==========================================

# 1. MAIN ACADEMIC LEVEL (The 6 Pillars)
class AcademicLevel(models.Model):
    LEVEL_CHOICES = (
        ('FOUNDATION', '1. Foundation Education'),
        ('PREPARATORY', '2. Preparatory Education'),
        ('MIDDLE', '3. Middle Education'),
        ('SECONDARY', '4. Secondary Education'),
        ('HIGHER', '5. Higher Education (UG/PG)'),
        ('HIGHER_PLUS', '6. Higher Education Plus'),
    )
    name = models.CharField(max_length=50, choices=LEVEL_CHOICES, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.get_name_display()

# 2. CLASS (e.g., LKG, UKG, Class 1, Class 2)
class AcademicClass(models.Model):
    level = models.ForeignKey(AcademicLevel, on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100) # e.g., Class 1
    code = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.name} ({self.level.name})"

# 3. SUBCLASS / GROUPS (e.g., Section A, Science Group)
class SubClass(models.Model):
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='subclasses')
    name = models.CharField(max_length=100) # e.g., Section A, PCM Batch
    
    # Client requirement: "CLASS INCHARGE"
    class_incharge = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='incharge_classes'
    )

    def __str__(self):
        return f"{self.academic_class.name} - {self.name}"

# 4. SUBJECTS & TEACHERS (Named AcademicSubject to avoid clash)
class AcademicSubject(models.Model):
    subclass = models.ForeignKey(SubClass, on_delete=models.CASCADE, related_name='academic_subjects')
    name = models.CharField(max_length=100) # e.g., Mathematics, English
    
    # Client requirement: "SUBJECTS TEACHERS"
    subject_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='teaching_academic_subjects'
    )
    
    # Client requirement: "CLASS BY AI"
    is_ai_assisted = models.BooleanField(default=False, help_text="Class / Content managed by AI")

    def __str__(self):
        return f"{self.name} ({self.subclass.name})"

# 5. TIMETABLE
class Timetable(models.Model):
    subject = models.ForeignKey(AcademicSubject, on_delete=models.CASCADE, related_name='timetables')
    day_of_week = models.CharField(max_length=20) # Monday, Tuesday...
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # Client requirement: "TIME TABLE BY AI"
    is_ai_scheduled = models.BooleanField(default=False, help_text="Time Table auto-generated by AI")

    def __str__(self):
        return f"{self.subject.name} | {self.day_of_week} ({self.start_time} - {self.end_time})"

# 6. SUPPORTING MATERIALS
class StudyMaterial(models.Model):
    # Client requirement: "BOOKS, QUESTIONS BANKS, QUETIONS MAKER"
    MATERIAL_TYPES = (
        ('BOOK', 'Books'),
        ('QUESTION_BANK', 'Questions Banks'),
        ('NOTES', 'Practice Notes / PDFs'),
    )
    subject = models.ForeignKey(AcademicSubject, on_delete=models.CASCADE, related_name='materials')
    material_type = models.CharField(max_length=50, choices=MATERIAL_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='supporting_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} [{self.get_material_type_display()}]"