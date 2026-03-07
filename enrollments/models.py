from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import date, timedelta
import uuid

# Related App Imports
from students.models import Student
from courses.models import Course
from fees.models import FeePlan, Installment

class Enrollment(models.Model):
    # --- CHOICES AS PER SRS ---
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / Show'),
        ('INACTIVE', 'Inactive / Hide'),
        ('SUSPENDED', 'Suspended'),
        ('COMPLETED', 'Course Completed'),
    )

    FEE_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Fully Paid'),
        ('PARTIAL', 'Partial / Installment'),
    )

    # --- CORE FIELDS ---
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    
    # --- HIERARCHY & CLASS MGMT (Category 2.6) ---
    class_name = models.CharField(max_length=100, null=True, blank=True, help_text="Level: e.g. Secondary")
    subclass = models.CharField(max_length=50, null=True, blank=True, help_text="Section: e.g. Section A")
    subjects = models.CharField(max_length=255, null=True, blank=True, help_text="e.g. Physics, Chemistry")
    sub_subjects = models.CharField(max_length=255, null=True, blank=True, help_text="e.g. Quantum Mechanics")
    
    # --- VALIDITY & ACCESS (SRS Requirement) ---
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField(null=True, blank=True, help_text="Expiry date of course access")
    
    # --- SYSTEM & ACCOUNT INFO ---
    mailbox_assigned = models.BooleanField(default=False, help_text="Is digital mailbox assigned?")
    mailbox_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    storage_limit_mb = models.IntegerField(default=500, help_text="Allocated storage in MB")
    
    # --- STATUS & TRACKING ---
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    fee_status = models.CharField(max_length=20, choices=FEE_STATUS_CHOICES, default='PENDING')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course')
        verbose_name = "Student Enrollment"
        ordering = ['-enrolled_at']

    def save(self, *args, **kwargs):
        # Auto-set Validity to 1 year if not provided
        if not self.valid_to:
            self.valid_to = timezone.now() + timedelta(days=365)
        
        # Auto-generate Mailbox ID if assigned
        if self.mailbox_assigned and not self.mailbox_id:
            self.mailbox_id = f"MB-{self.student.id}-{str(uuid.uuid4())[:4].upper()}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        s_name = getattr(self.student.user, 'first_name', f"SID-{self.student.id}")
        return f"{s_name} | {self.course.name} ({self.status})"


# ==============================================================================
# 🚀 SMART SIGNALS: AUTO-GENERATION LOGIC
# ==============================================================================

@receiver(post_save, sender=Enrollment)
def handle_new_enrollment(sender, instance, created, **kwargs):
    """
    Jab naya admission ho:
    1. Installments create karo.
    2. Student ka role 'Student' confirm karo.
    3. Account ledger entry initialize karo.
    """
    if created:
        try:
            # --- 1. GENERATE INSTALLMENTS ---
            plan = FeePlan.objects.filter(course=instance.course).first()

            if plan and plan.installment_count > 0:
                amount_per = plan.total_fee / plan.installment_count
                for i in range(plan.installment_count):
                    Installment.objects.create(
                        student=instance.student,
                        amount=round(amount_per, 2),
                        due_date=date.today() + timedelta(days=30 * (i + 1))
                    )
            else:
                # Fallback: Default 3 installments based on course fee
                fee = getattr(instance.course, 'fee', 0)
                if fee > 0:
                    amount_per = fee / 3
                    for i in range(3):
                        Installment.objects.create(
                            student=instance.student,
                            amount=round(amount_per, 2),
                            due_date=date.today() + timedelta(days=30 * (i + 1))
                        )

            # --- 2. LOG ACTIVITY (Super Admin Monitoring) ---
            # Agar ActivityLog model user ne banaya hai toh yahan call karein
            print(f"✅ Enrollment Success: {instance.student} enrolled in {instance.course}")

        except Exception as e:
            print(f"❌ Error in Enrollment Signal for ID {instance.id}: {str(e)}")