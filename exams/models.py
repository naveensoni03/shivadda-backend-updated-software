from django.db import models
from django.conf import settings
# from courses.models import Course  # Naye model banne ke baad iski zaroorat nahi
# from batches.models import Batch   # Naye model banne ke baad iski zaroorat nahi
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

# ==========================================
# 🔥 PHASE 1: ACADEMIC HIERARCHY (From PDF Point 7)
# ==========================================

class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g. Foundation, Middle, Secondary")
    def __str__(self): return self.name

class AcademicClass(models.Model):
    level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name="classes")
    name = models.CharField(max_length=100, help_text="e.g. Class 10, BCA")
    def __str__(self): return f"{self.name} ({self.level.name})"

class SubClass(models.Model):
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="subclasses")
    name = models.CharField(max_length=100, help_text="Section A, Science Stream, etc.")
    def __str__(self): return f"{self.academic_class.name} - {self.name}"

class Subject(models.Model):
    subclass = models.ForeignKey(SubClass, on_delete=models.CASCADE, related_name="subjects", null=True)
    name = models.CharField(max_length=150)
    is_optional = models.BooleanField(default=False)
    def __str__(self): return f"{self.name} ({self.subclass.name})"

class SyllabusUnit(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="units")
    name = models.CharField(max_length=200, help_text="e.g. Unit 1: Mechanics")
    def __str__(self): return self.name

class Chapter(models.Model):
    unit = models.ForeignKey(SyllabusUnit, on_delete=models.CASCADE, related_name="chapters")
    name = models.CharField(max_length=200)
    def __str__(self): return self.name


# ==========================================
# 🔥 PHASE 2: OMR BLUEPRINT (From PDF Point 8.6)
# ==========================================
class ExamBlueprint(models.Model):
    name = models.CharField(max_length=150, help_text="e.g. 100 Marks Standard Blueprint")
    total_questions = models.IntegerField(default=100)
    max_marks = models.FloatField(default=100.0)
    positive_mark_per_q = models.FloatField(default=1.0)
    negative_mark_per_q = models.FloatField(default=0.25)
    unattempted_mark_per_q = models.FloatField(default=0.0)
    passing_percentage = models.FloatField(default=33.0)

    def __str__(self):
        return f"{self.name} (Max: {self.max_marks})"


# ==========================================
# 1. EXAM STRUCTURE (UPDATED WITH HIERARCHY & BLUEPRINT)
# ==========================================
class Exam(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed')
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    title = models.CharField(max_length=150)
    
    # 🔥 Linked with Phase 1
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.SET_NULL, null=True, blank=True)
    subclass = models.ForeignKey(SubClass, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    syllabus_unit = models.ForeignKey(SyllabusUnit, on_delete=models.SET_NULL, null=True, blank=True)
    
    # 🔥 Linked with Phase 2
    blueprint = models.ForeignKey(ExamBlueprint, on_delete=models.SET_NULL, null=True, blank=True)

    # --- Paper Setup Fields ---
    examinee_body = models.CharField(max_length=150, blank=True, null=True)
    paper_set_number = models.CharField(max_length=50, blank=True, null=True)
    place_of_exam = models.CharField(max_length=150, blank=True, null=True)
    teacher_name = models.CharField(max_length=150, blank=True, null=True)

    # --- NEW FIELDS FOR FRONTEND META ---
    paper_id = models.CharField(max_length=100, blank=True, null=True)
    exam_password = models.CharField(max_length=100, blank=True, null=True)
    validity = models.CharField(max_length=100, blank=True, null=True)
    permission = models.CharField(max_length=100, blank=True, null=True)
    
    mode_of_exam = models.CharField(max_length=50, blank=True, null=True)
    tools_allowed = models.CharField(max_length=255, blank=True, null=True)
    exam_type = models.CharField(max_length=50, blank=True, null=True) # Mock Test etc.
    paper_type = models.CharField(max_length=50, blank=True, null=True) # Objective/Descriptive

    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    # Purane manual marks ko comment kar raha hoon kyunki ab Blueprint handle karega
    # total_marks = models.IntegerField(default=100)
    # passing_marks = models.IntegerField(default=33)
    # negative_marks = models.FloatField(default=0.0)
    
    duration_minutes = models.IntegerField(default=60)
    exam_date = models.DateField(null=True, blank=True, help_text="Exam date")
    is_notification_sent = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - Set {self.paper_set_number}"


# ==========================================
# 2. QUESTION BANK
# ==========================================
class QuestionBank(models.Model):
    DIFFICULTY_LEVELS = (('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard'), ('HOTS', 'HOTS'))
    TYPE_CHOICES = (('MCQ', 'MCQ'), ('Descriptive', 'Descriptive'), ('True/False', 'True/False'), ('Both', 'Both'), ('None', 'None'))

    text = models.TextField()
    q_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Descriptive')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='Medium')
    
    # 🔥 Linked to Hierarchy
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True)
    
    section = models.CharField(max_length=50, default="A", blank=True, null=True)
    level = models.CharField(max_length=50, default="Level 1", blank=True, null=True)
    exam_meta = models.JSONField(default=dict, blank=True, null=True)

    # --- MARKING SCHEME ---
    marks = models.FloatField(default=5.0) 
    negative_marks = models.FloatField(default=0.0) 
    unattempted_marks = models.FloatField(default=0.0) 
    
    # --- OMR OPTIONS (EXTENDED UP TO H) ---
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)
    option_e = models.CharField(max_length=255, null=True, blank=True)
    option_f = models.CharField(max_length=255, null=True, blank=True)
    option_g = models.CharField(max_length=255, null=True, blank=True)
    option_h = models.CharField(max_length=255, null=True, blank=True)
    correct_option = models.CharField(max_length=10, blank=True, null=True)

    options = models.JSONField(default=list, blank=True) # Legacy
    correct_answer = models.TextField(blank=True) # Legacy
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]


# ==========================================
# 3. QUESTION (EXAM SPECIFIC)
# ==========================================
class Question(models.Model):
    Q_TYPE_CHOICES = (('mcq', 'Multiple Choice'), ('subjective', 'Subjective / Theory'))

    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    q_type = models.CharField(max_length=20, choices=Q_TYPE_CHOICES, default='mcq')
    section = models.CharField(max_length=50, default="A", blank=True, null=True)
    
    # OMR Options
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)
    option_e = models.CharField(max_length=255, null=True, blank=True)
    option_f = models.CharField(max_length=255, null=True, blank=True)
    option_g = models.CharField(max_length=255, null=True, blank=True)
    option_h = models.CharField(max_length=255, null=True, blank=True)
    
    correct_option_index = models.IntegerField(default=0, null=True, blank=True) 
    correct_option = models.CharField(max_length=10, blank=True, null=True)
    
    marks = models.FloatField(default=1.0)

    def __str__(self):
        return self.text[:50]


# ==========================================
# 4. EXAM ATTEMPTS (🔥 UPDATED OMR TRACKING)
# ==========================================
class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # --- Detailed OMR Status ---
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    correct_count = models.IntegerField(default=0)
    incorrect_count = models.IntegerField(default=0)
    unattempted_count = models.IntegerField(default=0)
    
    # Track negative marks natively
    negative_marks_deducted = models.FloatField(default=0.0)

    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    grade = models.CharField(max_length=10, blank=True, null=True)
    
    is_evaluated = models.BooleanField(default=False)
    omr_sheet_image = models.ImageField(upload_to='omr_scans/', null=True, blank=True)

    @property
    def batch_rank(self):
        return 1

# ==========================================
# 5. STUDENT ANSWER
# ==========================================
class StudentAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=10, null=True, blank=True) # Blank if unattempted
    is_correct = models.BooleanField(default=False)
    marks_awarded = models.FloatField(default=0.0)

# ==========================================
# 6. STUDENT PERFORMANCE
# ==========================================
class StudentPerformance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True) # Linked to Hierarchy
    weak_topics = models.JSONField(default=list)
    improvement_score = models.IntegerField(default=0)
    accuracy_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    performance_prediction = models.TextField(blank=True, null=True)
    last_analyzed = models.DateTimeField(auto_now=True)

# ==========================================
# 7. DESCRIPTIVE SUBMISSION (3-TEACHER EVAL)
# ==========================================
class DescriptiveSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(QuestionBank, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    t1_score = models.FloatField(null=True, blank=True)
    t1_remarks = models.TextField(blank=True, null=True)
    t1_status = models.CharField(max_length=20, default="Pending")

    t2_score = models.FloatField(null=True, blank=True)
    t2_remarks = models.TextField(blank=True, null=True)
    t2_status = models.CharField(max_length=20, default="Pending")

    t3_score = models.FloatField(null=True, blank=True)
    t3_remarks = models.TextField(blank=True, null=True)
    t3_status = models.CharField(max_length=20, default="Pending")

    final_average_score = models.FloatField(null=True, blank=True)

class AnswerEvaluation(models.Model):
    submission = models.ForeignKey(DescriptiveSubmission, on_delete=models.CASCADE, related_name="evaluations")
    evaluator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score_awarded = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField()
    evaluated_at = models.DateTimeField(auto_now_add=True)

class AIEvaluationLog(models.Model):
    submission = models.OneToOneField(DescriptiveSubmission, on_delete=models.CASCADE)
    ai_score = models.IntegerField()
    ai_feedback = models.TextField()
    confidence_score = models.FloatField()

# ==========================================
# 10. LIVE QUIZ (KBC STYLE)
# ==========================================
class LiveQuizSession(models.Model):
    title = models.CharField(max_length=255, default="Mega Live Quiz")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    current_timer = models.IntegerField(default=0)
    conducted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

class QuizGroup(models.Model):
    session = models.ForeignKey(LiveQuizSession, related_name='groups', on_delete=models.CASCADE)
    group_name = models.CharField(max_length=50)
    main_score = models.IntegerField(default=0)
    bonus_score = models.IntegerField(default=0)
    def total_score(self): return self.main_score + self.bonus_score

# ==========================================
# 11. ASSIGNMENTS MODULE
# ==========================================
class Assignment(models.Model):
    STATUS_CHOICES = (('active', 'Active'), ('closed', 'Closed'))
    title = models.CharField(max_length=255)
    
    # Linked to Hierarchy
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    
    max_marks = models.FloatField(default=10.0)
    deadline_date = models.DateField(null=True, blank=True)
    deadline_time = models.TimeField(null=True, blank=True)
    instructions = models.TextField(blank=True, null=True)
    reference_file = models.FileField(upload_to='assignment_materials/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

class AssignmentSubmission(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('submitted', 'Submitted'), ('graded', 'Graded'))
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    submitted_file = models.FileField(upload_to='student_homeworks/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    marks_awarded = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)

# --- SIGNALS ---
@receiver(post_save, sender=Exam)
def notify_parents_on_new_exam(sender, instance, created, **kwargs):
    if created and instance.exam_date:
        print(f"DEBUG: Notification Triggered for {instance.title}")
        Exam.objects.filter(id=instance.id).update(is_notification_sent=True)
# ==========================================
# 12. LEADERBOARD & RANKING (FEATURE: COMPETITION)
# ==========================================
class ExamLeaderboard(models.Model):
    attempt = models.OneToOneField(ExamAttempt, on_delete=models.CASCADE, related_name='ranking')
    all_india_rank = models.IntegerField(null=True, blank=True, help_text="All India Rank")
    state_rank = models.IntegerField(null=True, blank=True, help_text="State Level Rank")
    percentile = models.FloatField(null=True, blank=True, help_text="Percentile Score")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AIR: {self.all_india_rank} - {self.attempt.student.username}"
