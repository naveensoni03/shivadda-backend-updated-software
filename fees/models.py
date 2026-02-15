from django.db import models
from django.utils.timezone import now
from students.models import Student
from courses.models import Course

# ----------------------------------------------------------------
# 1. Fee Transaction (MAIN MODEL FOR DASHBOARD & RECEIPT)
# ----------------------------------------------------------------
class FeeTransaction(models.Model):
    PAYMENT_MODES = [
        ('Cash', 'Cash'),
        ('UPI / Online', 'UPI / Online'),
        ('Cheque', 'Cheque'),
    ]

    STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Partial', 'Partial'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
    ]

    # Receipt Info
    transaction_id = models.CharField(max_length=100, unique=True, help_text="Unique Receipt No (e.g. REC-2026-101)")
    payment_date = models.DateField(default=now)
    
    # Student Details (Stored as Text to preserve Receipt History even if Student is deleted)
    student_name = models.CharField(max_length=150)
    roll_no = models.CharField(max_length=50, blank=True, null=True)
    student_class = models.CharField(max_length=50)  # e.g., "10-A"

    # Optional Link to Actual Student Record (For advanced queries)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')

    # Financials
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Metadata
    payment_mode = models.CharField(max_length=50, choices=PAYMENT_MODES, default='Cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Paid')
    
    # 🔥 JSON Field for Fee Breakdown (Tuition, Transport, Library, Fine)
    # Ye Frontend ke "breakdown" object ko store karega
    breakdown = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.student_name} ({self.status})"

    class Meta:
        ordering = ['-payment_date', '-created_at']


# ----------------------------------------------------------------
# 2. Fee Plan (For Future Automation - Optional)
# ----------------------------------------------------------------
class FeePlan(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    installment_count = models.IntegerField(default=1)
    penalty_per_day = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)

    def __str__(self):
        return f"{self.course} Plan - ₹{self.total_fee}"


# ----------------------------------------------------------------
# 3. Installment (For Tracking Dues - Optional)
# ----------------------------------------------------------------
class Installment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    penalty_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def calculate_penalty(self):
        """Automatic Penalty Calculation based on Due Date"""
        if not self.is_paid and now().date() > self.due_date:
            days_late = (now().date() - self.due_date).days
            fee_plan = FeePlan.objects.filter(course=self.student.course).first() if hasattr(self.student, 'course') else None
            rate = fee_plan.penalty_per_day if fee_plan else 50.00
            return days_late * rate
        return 0

    def __str__(self):
        return f"{self.student} - Due: {self.due_date}"