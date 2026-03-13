from django.db import models
from django.utils import timezone # Naya import StudyMaterial aur Mail ke time ke liye

# ==========================================
# 1. TEACHER MODEL
# ==========================================
class Teacher(models.Model):
    GENDER_CHOICES = (('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other'))

    # --- Identity ---
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    dob = models.DateField(null=True, blank=True)
    
    # --- Professional ---
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    department = models.CharField(max_length=100, default="General", help_text="e.g. Science, Commerce")
    subject = models.CharField(max_length=100, help_text="Main Subject")
    qualification = models.CharField(max_length=100, help_text="e.g. M.Sc, B.Ed")
    experience = models.CharField(max_length=50, help_text="e.g. 5 Years")
    designation = models.CharField(max_length=100, default="Assistant Teacher")
    joining_date = models.DateField(auto_now_add=True)
    
    # --- Salary ---
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


# ==========================================
# 2. STUDY MATERIAL MODEL
# ==========================================
class StudyMaterial(models.Model):
    # Teacher ke sath link kar diya (Agar teacher delete hua to uska material bhi delete ho jayega)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True) 
    title = models.CharField(max_length=255)
    subject_class = models.CharField(max_length=100) # e.g., "Class 12 Physics"
    material_type = models.CharField(max_length=50) # 'pdf', 'video', 'link'
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='study_materials/', blank=True, null=True) # File upload path
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.subject_class}"


# ==========================================
# 🔥 3. NAYA: TEACHER MAILBOX MODEL
# ==========================================
class TeacherMail(models.Model):
    FOLDER_CHOICES = (
        ('inbox', 'Inbox'),
        ('sent', 'Sent'),
        ('drafts', 'Drafts'),
        ('archive', 'Archive'),
        ('trash', 'Trash'),
    )
    
    LABEL_CHOICES = (
        ('urgent', 'Urgent'),
        ('assignments', 'Assignments'),
        ('parents', 'Parents'),
        ('general', 'General'),
    )

    # Jis teacher ka ye mailbox hai
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='mailbox')
    
    # --- Sender / Receiver Info ---
    sender_name = models.CharField(max_length=150)
    sender_email = models.EmailField()
    receiver_email = models.EmailField()
    
    # --- Mail Content ---
    subject = models.CharField(max_length=255, blank=True, null=True)
    snippet = models.CharField(max_length=255, blank=True, null=True, help_text="Short preview of the mail")
    body = models.TextField(blank=True, null=True)
    
    # --- Organization & State ---
    folder = models.CharField(max_length=20, choices=FOLDER_CHOICES, default='inbox')
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='general', blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    
    # --- Attachments ---
    has_attachment = models.BooleanField(default=False)
    attachment = models.FileField(upload_to='mail_attachments/', blank=True, null=True)
    
    # --- Timestamps ---
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.subject} ({self.folder}) - {self.sender_name}"

    class Meta:
        ordering = ['-created_at'] # Hamesha latest mail sabse upar aayega