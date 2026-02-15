import os
from django.db import models

BASE_DIR = os.getcwd()
MODELS_FILE = os.path.join(BASE_DIR, "api", "models.py")

print(f"ðŸ”§ Repairing Indentation in: {MODELS_FILE}")

# We will overwrite the file with the CLEAN, CORRECTLY INDENTED code.
# This ensures no syntax errors remain.

code_content = """from django.db import models

# --- EXAM SYSTEM MODELS ---
class Question(models.Model):
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]

# --- GLOBAL DIRECTORY MODELS ---

class Location(models.Model):
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="India")

    def __str__(self):
        return self.city

class Institution(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    
    # Newly Added Fields (Correctly Indented)
    phone = models.CharField(max_length=20, blank=True, null=True, default='')
    principal_name = models.CharField(max_length=200, blank=True, null=True, default='Not Assigned')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
"""

with open(MODELS_FILE, "w") as f:
    f.write(code_content)

print("âœ… SUCCESS: models.py has been repaired and formatted correctly.")
