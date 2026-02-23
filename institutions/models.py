from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid

# IMPORT: Ab hum Hierarchy wale Model ko use karenge (If exists)
from locations.models import Place 
from services.models import ServiceType, ServiceMode, EducationLevel 

class Institution(models.Model):
    PLAN_CHOICES = [
        ('FREE', 'Free Trial'),
        ('BASIC', 'Basic Plan'),
        ('PREMIUM', 'Premium Plan'),
    ]

    # ✅ Added MANAGEMENT TYPES from requirement
    MANAGEMENT_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
        ('COMPANY', 'Company'),
        ('TRUST', 'Trust'),
        ('NGO', 'NGO'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 1. Identity
    name = models.CharField(max_length=255)
    institution_code = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="e.g., BR-01")
    principal_name = models.CharField(max_length=255, null=True, blank=True) 
    management_type = models.CharField(max_length=50, choices=MANAGEMENT_CHOICES, null=True, blank=True) # ✅ NEW

    # 2. Owner & Contact
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_institution')
    contact_email = models.EmailField(unique=True)
    contact_phone = models.CharField(max_length=20)
    website = models.URLField(blank=True, null=True)

    # 3. Location (✅ Linked to New Place Hierarchy + Extra Geo Fields)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, related_name="institutions")
    address_details = models.TextField(help_text="Full street address", blank=True, null=True) # acts as address
    # ✅ NEW GEO FIELDS added as per frontend UI
    district = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    pin_code = models.CharField(max_length=20, null=True, blank=True)
    latitude = models.CharField(max_length=50, null=True, blank=True)
    longitude = models.CharField(max_length=50, null=True, blank=True)

    # 4. Services & Facilities (✅ Checkboxes & Tags from UI)
    service_type = models.ForeignKey(ServiceType, on_delete=models.PROTECT, null=True)
    service_mode = models.ForeignKey(ServiceMode, on_delete=models.PROTECT, null=True)
    levels = models.ManyToManyField(EducationLevel, blank=True)
    place_code = models.CharField(max_length=50, null=True, blank=True) # FOUNDATION, SECONDARY etc.
    
    # ✅ NEW FACILITIES
    has_library = models.BooleanField(default=False)
    has_hostel = models.BooleanField(default=False)
    has_transport = models.BooleanField(default=False)
    has_security = models.BooleanField(default=False)
    tech_used = models.JSONField(default=list, blank=True, null=True) # JSON Array for ['AI CHATGPT', 'LIVE CLASS']

    # 5. Subscription Logic
    subscription_plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='FREE')
    plan_start_date = models.DateTimeField(auto_now_add=True)
    plan_expiry_date = models.DateTimeField(blank=True, null=True)
    
    # 6. System Fields
    virtual_id = models.CharField(max_length=50, unique=True, blank=True, editable=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto Subscription Date Logic
        if not self.plan_expiry_date:
            days = 14 if self.subscription_plan == 'FREE' else (30 if self.subscription_plan == 'BASIC' else 365)
            self.plan_expiry_date = timezone.now() + timedelta(days=days)
        
        # Auto Virtual ID Logic (SHIV-INST-...)
        if not self.virtual_id:
            self.virtual_id = self.generate_virtual_id()

        super().save(*args, **kwargs)

    def generate_virtual_id(self):
        unique_seq = str(uuid.uuid4().int)[:6]
        return f"SHIV-INST-{unique_seq}"

    def __str__(self):
        return f"{self.name} ({self.virtual_id})"