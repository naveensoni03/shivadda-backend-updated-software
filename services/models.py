from django.db import models

# 1. Education Level (e.g. Foundation, Middle, Secondary, Higher)
class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 2. Service Type (e.g. Academic, Technical, Professional)
class ServiceType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True) # e.g. ACD, TECH
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 3. Service Mode (e.g. Online, Offline, Hybrid)
class ServiceMode(models.Model):
    name = models.CharField(max_length=50, unique=True)
    icon_name = models.CharField(max_length=50, blank=True) # UI icon name
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
    
    # 4. Management Type (Management, Official, Unofficial, Both, None)
class ManagementType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 5. Place & Service Code Mapping
class PlaceCodeMapping(models.Model):
    place_code = models.CharField(max_length=50, unique=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    latitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    services_code = models.CharField(max_length=50)
    users_code = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.place_code