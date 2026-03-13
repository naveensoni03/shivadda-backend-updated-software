from django.db import models
from django.conf import settings
from courses.models import Course
from batches.models import Batch
from django.db.models.signals import post_save
from django.dispatch import receiver

# ==========================================
# 1. EXAM STRUCTURE (UPDATED WITH PREMIUM FEATURES)
# ==========================================
class Exam(models.Model):
    # 🔥 NAYA: Status Toggles for Draft / Active / Completed (Frontend req)
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed')
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    title = models.CharField(max_length=150)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, null=True, blank=True)
    
    # --- Paper Setup Fields ---
    class_name = models.CharField(max_length=100, blank=True, null=True)
    subject_name = models.CharField(max_length=100, blank=True, null=True)
    examinee_body = models.CharField(max_length=150, blank=True, null=True)
    paper_set_number = models.CharField(max_length=50, blank=True, null=True)
    place_of_exam = models.CharField(max_length=150, blank=True, null=True)
    teacher_name = models.CharField(max_length=150, blank=True, null=True)

    # --- NEW FIELDS FOR FRONTEND META ---
    unit = models.CharField(max_length=100, blank=True, null=True)
    chapter_name = models.CharField(max_length=100, blank=True, null=True)
    paper_id = models.CharField(max_length=100, blank=True, null=True)
    exam_password = models.CharField(max_length=100, blank=True, null=True)
    validity = models.CharField(max_length=100, blank=True, null=True)
    permission = models.CharField(max_length=100, blank=True, null=True)
    
    # ✅ NEW: Toggles and Modes Added from Frontend
    mode_of_exam = models.CharField(max_length=50, blank=True, null=True)
    tools_allowed = models.CharField(max_length=255, blank=True, null=True)
    exam_type = models.CharField(max_length=50, blank=True, null=True) # Mock Test etc.
    paper_type = models.CharField(max_length=50, blank=True, null=True) # Objective/Descriptive

    # 🔥 NAYA: Start Time and End Time for specific scheduling
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    total_marks = models.IntegerField(default=100)
    passing_marks = models.IntegerField(default=33)
    duration_minutes = models.IntegerField(default=60)
    
    # 🔥 NAYA: Negative Marks field at Exam level
    negative_marks = models.FloatField(default=0.0)

    # --- SMS Notification Fields ---
    exam_date = models.DateField(null=True, blank=True, help_text="Exam date") # Changed to DateField to match TimeField logic
    is_notification_sent = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) # Added for sorting

    def __str__(self):
        return f"{self.title} - Set {self.paper_set_number}"


# ==========================================
# 2. QUESTION BANK
# ==========================================
class QuestionBank(models.Model):
    DIFFICULTY_LEVELS = (('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard'))
    TYPE_CHOICES = (('MCQ', 'MCQ'), ('Descriptive', 'Descriptive'), ('True/False', 'True/False'), ('Both', 'Both'), ('None', 'None'))

    text = models.TextField()
    q_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Descriptive')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='Medium')
    
    # --- NEW FRONTEND FIELDS ---
    section = models.CharField(max_length=50, default="A", blank=True, null=True)
    level = models.CharField(max_length=50, default="Level 1", blank=True, null=True) # ✅ NEW LEVEL FIELD
    exam_meta = models.JSONField(default=dict, blank=True, null=True)

    # --- MARKING SCHEME ---
    marks = models.FloatField(default=5.0) 
    negative_marks = models.FloatField(default=0.0) 
    unattempted_marks = models.FloatField(default=0.0) 
    
    # --- OMR OPTIONS (✅ EXTENDED UP TO H) ---
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)
    option_e = models.CharField(max_length=255, null=True, blank=True)
    option_f = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    option_g = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    option_h = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    correct_option = models.CharField(max_length=10, blank=True, null=True)

    subject = models.CharField(max_length=100, blank=True, null=True)
    options = models.JSONField(default=list, blank=True) # Legacy
    correct_answer = models.TextField(blank=True) # Legacy
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]


# ==========================================
# 3. QUESTION (EXAM SPECIFIC)
# ==========================================
class Question(models.Model):
    # 🔥 NAYA: Type Choices updated to match frontend logic
    Q_TYPE_CHOICES = (('mcq', 'Multiple Choice'), ('subjective', 'Subjective / Theory'))

    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    
    # 🔥 NAYA: Image field added for questions containing diagrams/equations
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    
    # 🔥 NAYA: Question Type
    q_type = models.CharField(max_length=20, choices=Q_TYPE_CHOICES, default='mcq')
    
    section = models.CharField(max_length=50, default="A", blank=True, null=True)
    level = models.CharField(max_length=50, default="Level 1", blank=True, null=True) # ✅ NEW LEVEL FIELD
    
    # --- OMR OPTIONS (✅ EXTENDED UP TO H) ---
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)
    option_e = models.CharField(max_length=255, null=True, blank=True)
    option_f = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    option_g = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    option_h = models.CharField(max_length=255, null=True, blank=True) # ✅ NEW
    
    # 🔥 NAYA: Integer based correct option (matches React frontend 0, 1, 2, 3)
    correct_option_index = models.IntegerField(default=0, null=True, blank=True) 
    
    # Purana correct option preserved
    correct_option = models.CharField(max_length=10, blank=True, null=True)
    
    marks = models.FloatField(default=1.0)
    negative_marks = models.FloatField(default=0.0)
    unattempted_marks = models.FloatField(default=0.0)

    def __str__(self):
        return self.text[:50]


# ==========================================
# 4. EXAM ATTEMPTS
# ==========================================
class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_evaluated = models.BooleanField(default=False)

    @property
    def batch_rank(self):
        return 1


# ==========================================
# 5. STUDENT ANSWER
# ==========================================
class StudentAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=10)
    is_correct = models.BooleanField(default=False)


# ==========================================
# 6. STUDENT PERFORMANCE
# ==========================================
class StudentPerformance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.ForeignKey(Course, on_delete=models.CASCADE)
    weak_topics = models.JSONField(default=list)
    improvement_score = models.IntegerField(default=0)
    accuracy_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    performance_prediction = models.TextField(blank=True, null=True)
    last_analyzed = models.DateTimeField(auto_now=True)


# ==========================================
# 7. DESCRIPTIVE SUBMISSION
# ==========================================
class DescriptiveSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(QuestionBank, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)


# ==========================================
# 8. ANSWER EVALUATION
# ==========================================
class AnswerEvaluation(models.Model):
    submission = models.ForeignKey(DescriptiveSubmission, on_delete=models.CASCADE, related_name="evaluations")
    evaluator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score_awarded = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField()
    evaluated_at = models.DateTimeField(auto_now_add=True)


# ==========================================
# 9. AI LOG
# ==========================================
class AIEvaluationLog(models.Model):
    submission = models.OneToOneField(DescriptiveSubmission, on_delete=models.CASCADE)
    ai_score = models.IntegerField()
    ai_feedback = models.TextField()
    confidence_score = models.FloatField()


# ==========================================
# 10. 🔥 NEW: ASSIGNMENTS MODULE
# ==========================================
class Assignment(models.Model):
    STATUS_CHOICES = (('active', 'Active'), ('closed', 'Closed'))

    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=150) # Frontend ke dropdown ke liye
    max_marks = models.FloatField(default=10.0)
    
    deadline_date = models.DateField(null=True, blank=True)
    deadline_time = models.TimeField(null=True, blank=True)
    
    instructions = models.TextField(blank=True, null=True)
    reference_file = models.FileField(upload_to='assignment_materials/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.subject}"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('submitted', 'Submitted'), ('graded', 'Graded'))

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    submitted_file = models.FileField(upload_to='student_homeworks/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    marks_awarded = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


# --- SIGNALS ---
@receiver(post_save, sender=Exam)
def notify_parents_on_new_exam(sender, instance, created, **kwargs):
    if created and instance.exam_date:
        print(f"DEBUG: Notification Triggered for {instance.title}")
        Exam.objects.filter(id=instance.id).update(is_notification_sent=True)