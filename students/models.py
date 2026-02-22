from django.db import models

class AcademicSession(models.Model):
    year = models.CharField(max_length=9, help_text="e.g., 2024-2025")
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.year

class Student(models.Model):
    # --- CHOICES ---
    GENDER_CHOICES = (('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other'))
    BLOOD_GROUP_CHOICES = (('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-'))
    CATEGORY_CHOICES = (('General', 'General'), ('OBC', 'OBC'), ('SC', 'SC'), ('ST', 'ST'), ('EWS', 'EWS'))
    FEE_STATUS_CHOICES = (('Paid', 'Paid'), ('Pending', 'Pending'))
    
    # 🚀 NEW: SUPER ADMIN CHOICES
    STATUS_CHOICES = (
        ('Active', 'Active'), 
        ('Deactivated', 'Deactivated'), 
        ('Hibernation', 'Hibernation'), 
        ('Hidden', 'Hidden')
    )
    REG_CHOICES = (
        ('Registered', 'Registered'), 
        ('Non-Registered', 'Non-Registered'), 
        ('Both', 'Both'), 
        ('None', 'None')
    )

    # --- 1. CORE ACADEMIC INFO ---
    session = models.ForeignKey(AcademicSession, on_delete=models.SET_NULL, null=True, blank=True)
    admission_number = models.CharField(max_length=50, unique=True)
    virtual_id = models.CharField(max_length=100, unique=True, blank=True, null=True) # ✅ NEW (Front-End Sync)
    roll_number = models.CharField(max_length=20)
    student_class = models.CharField(max_length=20) 
    section = models.CharField(max_length=10) 
    admission_date = models.DateField(auto_now_add=True)
    fee_status = models.CharField(max_length=20, choices=FEE_STATUS_CHOICES, default='Pending')

    # --- 2. PERSONAL INFO (Deep Profile) ---
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    place_of_birth = models.CharField(max_length=100, blank=True, null=True) # ✅ NEW
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    religion = models.CharField(max_length=50, blank=True, null=True)
    nationality = models.CharField(max_length=50, default='Indian')
    aadhar_number = models.CharField(max_length=12, unique=True, blank=True, null=True)
    
    # 🚀 NEW: Physical & Marital Details
    height = models.CharField(max_length=20, blank=True, null=True)
    weight = models.CharField(max_length=20, blank=True, null=True)
    marital_status = models.CharField(max_length=20, default='No', choices=[('Yes','Yes'), ('No','No'), ('Other','Other')])
    spouse_name = models.CharField(max_length=100, blank=True, null=True)

    # --- 3. PARENTS / GUARDIAN INFO ---
    father_name = models.CharField(max_length=100)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_name = models.CharField(max_length=100)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)

    # --- 4. CONTACT & ADDRESS ---
    primary_mobile = models.CharField(max_length=15)
    secondary_mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    current_address = models.TextField()
    permanent_address = models.TextField(blank=True, null=True) # ✅ NEW (Front-End Sync)
    city = models.CharField(max_length=50, default='Meerut')
    state = models.CharField(max_length=50, default='Uttar Pradesh')
    pincode = models.CharField(max_length=10, blank=True)

    # --- 5. MASTER PLACE & SERVICE MAPPING (Super Admin) ---
    place_id = models.CharField(max_length=50, blank=True, null=True)
    subplace_id = models.CharField(max_length=50, blank=True, null=True)
    service_id = models.CharField(max_length=50, blank=True, null=True)
    subservice_id = models.CharField(max_length=50, blank=True, null=True)
    user_group = models.CharField(max_length=50, default='Service Seekers')
    user_subgroup = models.CharField(max_length=50, default='Students')

    # --- 6. QUALIFICATIONS & PORTFOLIO (Super Admin) ---
    highest_qualification = models.CharField(max_length=150, blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    hobbies = models.CharField(max_length=200, blank=True, null=True)
    beliefs = models.CharField(max_length=200, blank=True, null=True)

    # --- 7. VALIDITY & ADVANCED STATUS (Super Admin) ---
    registration_status = models.CharField(max_length=50, choices=REG_CHOICES, default='Registered')
    validity_start = models.DateField(blank=True, null=True)
    validity_end = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')

    # --- 8. FILES / SCANS ---
    student_photo = models.ImageField(upload_to='students/photos/', blank=True, null=True)
    aadhar_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    tc_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    marksheet_scan = models.FileField(upload_to='students/docs/', blank=True, null=True) # ✅ NEW (Front-End Sync)

    is_active = models.BooleanField(default=True) # Legacy status
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"