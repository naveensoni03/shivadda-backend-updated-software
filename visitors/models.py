from django.db import models
from django.utils import timezone

class Visitor(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    # --- Existing Basic Fields ---
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    purpose = models.TextField()
    person_to_meet = models.CharField(max_length=100, help_text="Whom to meet?")
    check_in_time = models.DateTimeField(default=timezone.now)
    check_out_time = models.DateTimeField(null=True, blank=True)
    is_checked_out = models.BooleanField(default=False)

    # --- NEW FIELDS (Added from Frontend Upgrades) ---
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    id_proof = models.CharField(max_length=50, blank=True, null=True, help_text="Aadhar/PAN No.")
    address = models.TextField(blank=True, null=True)
    photo = models.TextField(blank=True, null=True, help_text="Stores Base64 Image Data from Webcam")
    terms_accepted = models.BooleanField(default=False)
    
    # --- Blueprint Tracking Fields ---
    place_id = models.CharField(max_length=50, default="IND-UP-JAUNPUR-01")
    virtual_id = models.CharField(max_length=50, default="V-SEC-001")
    allocated_mb = models.IntegerField(default=50)

    # ✨ NEW ADDED: Identity File, Vehicle & Accompanying Persons
    id_proof_file = models.FileField(upload_to='visitor_ids/', blank=True, null=True, help_text="Uploaded ID Document (Image/PDF)")
    vehicle_number = models.CharField(max_length=30, blank=True, null=True, help_text="Optional Vehicle Number")
    accompanying_persons = models.IntegerField(default=0, help_text="Number of people accompanying the visitor")

    def __str__(self):
        return f"{self.name} - {self.phone}"