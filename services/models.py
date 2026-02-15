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