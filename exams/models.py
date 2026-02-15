from django.db import models
from django.conf import settings
from courses.models import Course
from batches.models import Batch
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. Exam Structure
class Exam(models.Model):
    title = models.CharField(max_length=150)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    chapter_name = models.CharField(max_length=100, blank=True, null=True)
    total_marks = models.IntegerField(default=100)
    passing_marks = models.IntegerField(default=33)
    duration_minutes = models.IntegerField(default=60)

    # --- SMS Notification Fields ---
    exam_date = models.DateTimeField(null=True, blank=True, help_text="Exam date")
    is_notification_sent = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title}"


# 2. Question Bank
class QuestionBank(models.Model):
    DIFFICULTY_LEVELS = (('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard'))
    TYPE_CHOICES = (('MCQ', 'MCQ'), ('Descriptive', 'Descriptive'), ('True/False', 'True/False'))

    text = models.TextField()
    q_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Descriptive')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='Medium')
    marks = models.IntegerField(default=5)
    subject = models.CharField(max_length=100, blank=True, null=True)

    options = models.JSONField(default=list, blank=True)
    correct_answer = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


# 3. Question (Exam Specific)
class Question(models.Model):
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)
    correct_option = models.CharField(max_length=1)
    marks = models.IntegerField(default=1)

    def __str__(self):
        return self.text[:50]


# 4. Exam Attempts
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


# 5. Student Answer
class StudentAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)


# 6. Student Performance
class StudentPerformance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.ForeignKey(Course, on_delete=models.CASCADE)
    weak_topics = models.JSONField(default=list)
    improvement_score = models.IntegerField(default=0)
    accuracy_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    performance_prediction = models.TextField(blank=True, null=True)
    last_analyzed = models.DateTimeField(auto_now=True)


# 7. Descriptive Submission
class DescriptiveSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(QuestionBank, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)


# 8. Answer Evaluation
class AnswerEvaluation(models.Model):
    submission = models.ForeignKey(DescriptiveSubmission, on_delete=models.CASCADE, related_name="evaluations")
    evaluator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score_awarded = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField()
    evaluated_at = models.DateTimeField(auto_now_add=True)


# 9. AI Log
class AIEvaluationLog(models.Model):
    submission = models.OneToOneField(DescriptiveSubmission, on_delete=models.CASCADE)
    ai_score = models.IntegerField()
    ai_feedback = models.TextField()
    confidence_score = models.FloatField()


# --- SIGNALS ---
@receiver(post_save, sender=Exam)
def notify_parents_on_new_exam(sender, instance, created, **kwargs):
    if created and instance.exam_date:
        print(f"DEBUG: Notification Triggered for {instance.title}")
        Exam.objects.filter(id=instance.id).update(is_notification_sent=True)