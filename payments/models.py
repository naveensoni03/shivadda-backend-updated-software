import uuid
from django.db import models
from django.utils.timezone import now
from django.conf import settings


def generate_invoice_number(prefix="INV"):
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


# ============================================================
# 1. SERVICE CATALOG — Admin defines payable services
# ============================================================
class ServiceCatalog(models.Model):
    SERVICE_TYPES = [
        ('course_access', 'Course Access'),
        ('assignment_exam_access', 'Assignment & Exam Access'),
        ('exam', 'Exam Access'),
        ('course', 'Course'),
        ('hostel', 'Hostel Fee'),
        ('library', 'Library Access'),
        ('transport', 'Transport Fee'),
        ('custom', 'Custom Service'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES, default='custom')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Original price before discount (for strikethrough display)")
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_chargeable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False, help_text="Show 'Most Popular' badge on card")
    badge_text = models.CharField(max_length=50, blank=True, help_text="e.g. '75% off', 'Best Value'")
    color = models.CharField(max_length=20, default='#4f46e5', help_text="Card accent hex color")
    features = models.JSONField(default=list, blank=True,
        help_text="List of feature strings shown on the card")
    validity_days = models.IntegerField(default=365)
    icon = models.CharField(max_length=50, default='BookOpen')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_services'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Service Catalog"
        verbose_name_plural = "Service Catalog"

    def get_gst_amount(self):
        return round(self.price * self.gst_percentage / 100, 2)

    def get_total_price(self):
        return round(self.price + self.get_gst_amount(), 2)

    def __str__(self):
        return f"{self.name} — ₹{self.price}"


# ============================================================
# 2. STUDENT SERVICE PAYMENT — Records every student payment
# ============================================================
class StudentServicePayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
        ('emi', 'EMI'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Who paid
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='service_payments'
    )
    student = models.ForeignKey(
        'students.Student', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='service_payments'
    )

    # What was paid for
    service = models.ForeignKey(
        ServiceCatalog, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payments'
    )
    # Snapshot fields — in case service is updated/deleted later
    service_name_snapshot = models.CharField(max_length=200)
    service_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    service_type_snapshot = models.CharField(max_length=50, default='custom')

    # Invoice
    invoice_number = models.CharField(max_length=100, unique=True, default='')

    # Razorpay IDs
    razorpay_order_id = models.CharField(max_length=150, blank=True)
    razorpay_payment_id = models.CharField(max_length=150, blank=True)
    razorpay_signature = models.CharField(max_length=500, blank=True)

    # Amounts
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, blank=True)
    notes = models.TextField(blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Student Payment"
        verbose_name_plural = "Student Payments"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_invoice_number("STU")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} — {self.user} — ₹{self.total_amount} ({self.status})"


# ============================================================
# 3. SERVICE ACCESS — Controls which student can access what
# ============================================================
class ServiceAccess(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='service_access'
    )
    service = models.ForeignKey(
        ServiceCatalog, on_delete=models.CASCADE,
        related_name='access_records'
    )
    payment = models.ForeignKey(
        StudentServicePayment, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'service']
        verbose_name = "Service Access"
        verbose_name_plural = "Service Access Records"

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and now() > self.expires_at:
            return False
        return True

    def __str__(self):
        return f"{self.user} → {self.service.name} ({'Active' if self.is_valid() else 'Expired'})"


# ============================================================
# 4. TEACHER BANK DETAILS
# ============================================================
class TeacherBankDetails(models.Model):
    ACCOUNT_TYPES = [
        ('savings', 'Savings'),
        ('current', 'Current'),
    ]

    teacher = models.OneToOneField(
        'teachers.Teacher', on_delete=models.CASCADE,
        related_name='bank_details'
    )
    account_holder_name = models.CharField(max_length=200)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=100)
    branch_name = models.CharField(max_length=100, blank=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='savings')
    upi_id = models.CharField(max_length=100, blank=True, help_text="Optional UPI ID")
    is_verified = models.BooleanField(default=False, help_text="Admin verifies bank details")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Teacher Bank Details"

    def __str__(self):
        return f"{self.teacher.full_name} — {self.bank_name} ({self.account_number[-4:]})"


# ============================================================
# 5. TEACHER SALARY PAYMENT — Admin records salary payments
# ============================================================
class TeacherSalaryPayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('hold', 'On Hold'),
    ]

    PAYMENT_MODE_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('cheque', 'Cheque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    teacher = models.ForeignKey(
        'teachers.Teacher', on_delete=models.CASCADE,
        related_name='salary_payments'
    )

    # Invoice
    invoice_number = models.CharField(max_length=100, unique=True, default='')

    # Salary Details
    month = models.CharField(max_length=20, help_text="e.g. April 2026")
    salary_amount = models.DecimalField(max_digits=10, decimal_places=2)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Bank Snapshot at time of payment
    bank_account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)

    # Transaction Info
    payment_mode = models.CharField(max_length=30, choices=PAYMENT_MODE_CHOICES, default='bank_transfer')
    transaction_reference = models.CharField(max_length=150, blank=True, help_text="UTR/Cheque No/UPI Ref")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='salary_payments_made'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Teacher Salary Payment"
        verbose_name_plural = "Teacher Salary Payments"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_invoice_number("SAL")
        # Auto-calculate net
        self.net_amount = self.salary_amount + self.bonus - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} — {self.teacher.full_name} — {self.month} — ₹{self.net_amount}"
