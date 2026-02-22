from django.db import models

# 1. Education Level
class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 2. Service Type
class ServiceType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 3. Service Mode
class ServiceMode(models.Model):
    name = models.CharField(max_length=50, unique=True)
    icon_name = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name
    
# 4. Management Type
class ManagementType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 5. Place & Service Code Mapping
class PlaceCodeMapping(models.Model):
    place_code = models.CharField(max_length=50, unique=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    latitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    services_code = models.CharField(max_length=50)
    users_code = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.place_code

# --- 🚀 NEW SUPER ADMIN MODELS ---

# 6. Nature of Services (Permanent, Adhoc, etc.)
class NatureOfService(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 7. Service Seekers Groups (Students, Parents, Guests)
class ServiceSeekerGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 8. Service Providers Groups (Office, Fields Working, Both)
class ServiceProviderGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 9. Service Charges / Validity
class ServiceCharge(models.Model):
    service_name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    validity_months = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.service_name} - {self.amount}"