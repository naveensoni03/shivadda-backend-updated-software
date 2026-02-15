from django.db import models

class AcademicSession(models.Model):
    year = models.CharField(max_length=9, help_text="e.g., 2024-2025")
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.year

class Student(models.Model):
    GENDER_CHOICES = (('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other'))
    BLOOD_GROUP_CHOICES = (('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-'))
    CATEGORY_CHOICES = (('General', 'General'), ('OBC', 'OBC'), ('SC', 'SC'), ('ST', 'ST'), ('EWS', 'EWS'))
    FEE_STATUS_CHOICES = (('Paid', 'Paid'), ('Pending', 'Pending'))

    session = models.ForeignKey(AcademicSession, on_delete=models.SET_NULL, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    religion = models.CharField(max_length=50, blank=True, null=True)
    nationality = models.CharField(max_length=50, default='Indian')
    aadhar_number = models.CharField(max_length=12, unique=True, blank=True, null=True)
    admission_number = models.CharField(max_length=50, unique=True)
    roll_number = models.CharField(max_length=20)
    student_class = models.CharField(max_length=20) 
    section = models.CharField(max_length=10) 
    admission_date = models.DateField(auto_now_add=True)
    fee_status = models.CharField(max_length=20, choices=FEE_STATUS_CHOICES, default='Pending')
    father_name = models.CharField(max_length=100)
    mother_name = models.CharField(max_length=100)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    primary_mobile = models.CharField(max_length=15)
    secondary_mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    current_address = models.TextField()
    city = models.CharField(max_length=50, default='Meerut')
    state = models.CharField(max_length=50, default='Uttar Pradesh')
    pincode = models.CharField(max_length=10, blank=True)
    student_photo = models.ImageField(upload_to='students/photos/', blank=True, null=True)
    aadhar_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    tc_scan = models.FileField(upload_to='students/docs/', blank=True, null=True)
    is_active = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"