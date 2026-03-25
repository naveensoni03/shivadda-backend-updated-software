from django.db import models
from django.conf import settings
from students.models import Student


class StudentProfile(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)



class PhysicalMedicalProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medical_profile')
    blood_group = models.CharField(max_length=5, blank=True, null=True, help_text="e.g. A+, O-")
    height_cm = models.FloatField(blank=True, null=True, help_text="Height in centimeters")
    weight_kg = models.FloatField(blank=True, null=True, help_text="Weight in kilograms")
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True, null=True)
    emergency_contact_number = models.CharField(max_length=20, blank=True, null=True)
    chronic_diseases = models.TextField(blank=True, null=True, help_text="Any medical history or allergies")

    def __str__(self):
        return f"Medical Profile - {self.user.email}"

class AcademicSkillsProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academic_profile')
    tenth_school = models.CharField(max_length=255, blank=True, null=True)
    tenth_year = models.IntegerField(blank=True, null=True)
    tenth_percentage = models.FloatField(blank=True, null=True)
    
    twelfth_school = models.CharField(max_length=255, blank=True, null=True)
    twelfth_year = models.IntegerField(blank=True, null=True)
    twelfth_percentage = models.FloatField(blank=True, null=True)
    
    graduation_degree = models.CharField(max_length=100, blank=True, null=True)
    graduation_college = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    graduation_percentage = models.FloatField(blank=True, null=True)
    
    extra_certifications = models.TextField(blank=True, null=True)
    technical_skills = models.TextField(blank=True, null=True, help_text="Comma separated skills")

    def __str__(self):
        return f"Academic Profile - {self.user.email}"

class ProfessionalJobProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='professional_profile')
    total_experience_years = models.IntegerField(default=0)
    total_experience_months = models.IntegerField(default=0)
    last_company_name = models.CharField(max_length=255, blank=True, null=True)
    last_job_title = models.CharField(max_length=100, blank=True, null=True)
    last_salary = models.CharField(max_length=50, blank=True, null=True)
    reason_for_leaving = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Professional Profile - {self.user.email}"

class SocialHumanityProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_profile')
    blood_donation_history = models.TextField(blank=True, null=True, help_text="Dates and places of donation")
    ngo_social_work = models.TextField(blank=True, null=True, help_text="NGO names or volunteer work")
    awards_achievements = models.TextField(blank=True, null=True, help_text="Special recognitions")

    def __str__(self):
        return f"Social Profile - {self.user.email}"