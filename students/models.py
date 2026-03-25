from django.db import models
from django.conf import settings 
# ✨ NEW: ParentProfile ko import karo
from parents.models import ParentProfile 

class AcademicSession(models.Model):
    year = models.CharField(max_length=9, help_text="e.g., 2024-2025")
    is_active = models.BooleanField(default=False)
    def __str__(self): return self.year

class Student(models.Model):
    # --- 🔐 AUTHENTICATION LINK ---
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='student_profile')
    
    # ✨ NEW: Parent Relation Add Kiya
    parent = models.ForeignKey(ParentProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='children', help_text="Link this student to a parent profile")
    
    role = models.CharField(max_length=50, default='Student', editable=False)

    # --- CHOICES ---
    GENDER_CHOICES = (('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other'))
    BLOOD_GROUP_CHOICES = (('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-'))
    CATEGORY_CHOICES = (('General', 'General'), ('OBC', 'OBC'), ('SC', 'SC'), ('ST', 'ST'), ('EWS', 'EWS'))
    FEE_STATUS_CHOICES = (('Paid', 'Paid'), ('Pending', 'Pending'))
    STATUS_CHOICES = (('Active', 'Active'), ('Deactivated', 'Deactivated'), ('Hibernation', 'Hibernation'), ('Hidden', 'Hidden'))
    REG_CHOICES = (('Registered', 'Registered'), ('Non-Registered', 'Non-Registered'), ('Both', 'Both'), ('None', 'None'))

    # --- 1. CORE ACADEMIC INFO ---
    session = models.ForeignKey(AcademicSession, on_delete=models.SET_NULL, null=True, blank=True)
    batch_session = models.CharField(max_length=50, blank=True, null=True) 
    admission_number = models.CharField(max_length=50, unique=True)
    virtual_id = models.CharField(max_length=100, unique=True, blank=True, null=True) 
    roll_number = models.CharField(max_length=20, blank=True, null=True)
    student_class = models.CharField(max_length=20) 
    section = models.CharField(max_length=10, default="A") 
    admission_date = models.DateField(auto_now_add=True)
    fee_status = models.CharField(max_length=20, choices=FEE_STATUS_CHOICES, default='Pending')
    previous_school = models.CharField(max_length=150, blank=True, null=True) 
    tc_number = models.CharField(max_length=50, blank=True, null=True) 
    scholarship_percent = models.CharField(max_length=10, blank=True, null=True) 

    # --- 2. PERSONAL INFO ---
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    dob = models.DateField()
    place_of_birth = models.CharField(max_length=100, blank=True, null=True) 
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    religion = models.CharField(max_length=50, blank=True, null=True)
    nationality = models.CharField(max_length=50, default='Indian')
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    
    # 🚀 Physical & Marital Details
    height = models.CharField(max_length=20, blank=True, null=True)
    weight = models.CharField(max_length=20, blank=True, null=True)
    marital_status = models.CharField(max_length=20, default='No')
    spouse_name = models.CharField(max_length=100, blank=True, null=True)

    # --- 3. PARENTS / GUARDIAN INFO ---
    # In details ko hum naye ParentProfile model se automatically link karne ke baad use kar sakte hain
    father_name = models.CharField(max_length=100, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_name = models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)

    # --- 4. CONTACT & ADDRESS & GEOLOCATION ---
    primary_mobile = models.CharField(max_length=15, blank=True, null=True)
    secondary_mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    current_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True) 
    city = models.CharField(max_length=50, default='Meerut')
    state = models.CharField(max_length=50, default='Uttar Pradesh')
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    continent = models.CharField(max_length=50, default='Asia') 
    country = models.CharField(max_length=50, default='India') 
    latitude = models.CharField(max_length=50, blank=True, null=True) 
    longitude = models.CharField(max_length=50, blank=True, null=True) 

    # --- 5. MASTER PLACE & SERVICE MAPPING ---
    place_id = models.CharField(max_length=50, blank=True, null=True)
    subplace_id = models.CharField(max_length=50, blank=True, null=True)
    service_id = models.CharField(max_length=50, blank=True, null=True)
    subservice_id = models.CharField(max_length=50, blank=True, null=True)
    user_group = models.CharField(max_length=50, default='Service Seekers')
    user_subgroup = models.CharField(max_length=50, default='Students')

    # --- 6. QUALIFICATIONS & PORTFOLIO ---
    highest_qualification = models.CharField(max_length=150, blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    hobbies = models.CharField(max_length=200, blank=True, null=True)
    beliefs = models.CharField(max_length=200, blank=True, null=True)

    # --- 7. VALIDITY, TRANSPORT & STATUS ---
    registration_status = models.CharField(max_length=50, choices=REG_CHOICES, default='Registered')
    validity_start = models.DateField(blank=True, null=True)
    validity_end = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    transport_mode = models.CharField(max_length=50, blank=True, null=True) 

    # --- 8. FILES / SCANS ---
    photo = models.ImageField(upload_to='students/photos/', blank=True, null=True) 
    aadhar_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    tc_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    marksheet_scan = models.FileField(upload_to='students/docs/', blank=True, null=True) 

    is_active = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"