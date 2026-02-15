from django.db import models

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
    # 🚀 CLEANED UP: Ek hi baar rakhein
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