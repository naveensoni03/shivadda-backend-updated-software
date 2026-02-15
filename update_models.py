import os

BASE_DIR = os.getcwd()
MODELS_FILE = os.path.join(BASE_DIR, "api", "models.py")

print(f"ðŸ”§ Safely Updating Models in: {MODELS_FILE}")

# 1. Read existing content to avoid overwriting
with open(MODELS_FILE, "r") as f:
    content = f.read()

# 2. Check if Institution already exists
if "class Institution" in content:
    print("âœ… Models seem to be already there. Skipping update.")
else:
    # 3. Append new models to the end of the file
    new_models = """

# --- ADDED FOR GLOBAL SEEDING ---

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
    with open(MODELS_FILE, "a") as f:
        f.write(new_models)
    print("âœ… Successfully appended Institution, Location, and Service models.")

print("\nðŸ”„ Now run: python manage.py makemigrations api")
