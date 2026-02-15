import os
import django
from django.db import connection

# --- SETUP ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

MODELS_FILE = os.path.join(os.getcwd(), "api", "models.py")

print(f"ðŸ”§ Adding 'principal_name' to Institution Model...")

# 1. READ FILE
with open(MODELS_FILE, "r") as f:
    content = f.read()

# 2. CHECK & APPEND
if "principal_name =" in content:
    print("âœ… Field 'principal_name' already exists.")
else:
    # We replace the class definition line to inject the field safely or append it
    # A safer way for this specific file structure:
    new_field = "    principal_name = models.CharField(max_length=200, blank=True, null=True, default='Not Assigned')\n"
    
    # Find the Institution class and add field after 'name'
    if "class Institution(models.Model):" in content:
        parts = content.split("class Institution(models.Model):")
        # Add field to the second part (inside the class)
        updated_content = parts[0] + "class Institution(models.Model):\n" + new_field + parts[1]
        
        with open(MODELS_FILE, "w") as f:
            f.write(updated_content)
        print("âœ… Added 'principal_name' field to models.py")
    else:
        print("âŒ Error: Could not find Institution model class.")

print("\nðŸ”„ NOW RUN THESE COMMANDS MANUALLY:")
print("1. python manage.py makemigrations api")
print("2. python manage.py migrate")
