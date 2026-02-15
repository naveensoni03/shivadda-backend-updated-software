import os
import shutil
import sys

BASE_DIR = os.getcwd()

# --- 1. MOVE FOLDER (If nested) ---
nested_api = os.path.join(BASE_DIR, "backend", "api")
target_api = os.path.join(BASE_DIR, "api")

if os.path.exists(nested_api) and not os.path.exists(target_api):
    print(f"ðŸ“¦ Moving 'api' folder to root: {target_api}")
    shutil.move(nested_api, target_api)
elif os.path.exists(target_api):
    print("âœ… 'api' folder is already in the correct place.")
else:
    print(f"âš ï¸ Could not find 'api' folder at {nested_api}. Assuming manual fix.")

# --- 2. FIND SETTINGS.PY ---
settings_path = None
# Try common locations
potential_paths = [
    os.path.join(BASE_DIR, "backend", "settings.py"),
    os.path.join(BASE_DIR, "core", "settings.py"),
    os.path.join(BASE_DIR, "shivadda", "settings.py"),
]

for p in potential_paths:
    if os.path.exists(p):
        settings_path = p
        break

if not settings_path:
    print("âŒ Error: Could not find settings.py. Please edit it manually.")
    sys.exit(1)

print(f"ðŸ”§ Configuring Settings: {settings_path}")

# --- 3. UPDATE INSTALLED_APPS ---
with open(settings_path, "r") as f:
    content = f.read()

if "'api'" not in content and '"api"' not in content:
    if "INSTALLED_APPS = [" in content:
        content = content.replace("INSTALLED_APPS = [", "INSTALLED_APPS = [\n    'api',\n    'rest_framework',\n    'corsheaders',")
        print("âœ… Added 'api', 'rest_framework', and 'corsheaders' to INSTALLED_APPS")
    else:
        print("âš ï¸ Could not automatically patch INSTALLED_APPS. Check formatting.")

# --- 4. ADD CORS MIDDLEWARE (Important for React) ---
if "'corsheaders.middleware.CorsMiddleware'" not in content:
    content = content.replace(
        "MIDDLEWARE = [",
        "MIDDLEWARE = [\n    'corsheaders.middleware.CorsMiddleware',"
    )
    # Allow all origins for dev
    content += "\nCORS_ALLOW_ALL_ORIGINS = True\n"
    print("âœ… Added CORS Middleware")

with open(settings_path, "w") as f:
    f.write(content)

# --- 5. UPDATE URLS.PY ---
urls_path = os.path.join(os.path.dirname(settings_path), "urls.py")
print(f"ðŸ”— Linking URLs: {urls_path}")

with open(urls_path, "r") as f:
    u_content = f.read()

if "api.urls" not in u_content:
    # Ensure include is imported
    if "from django.urls import path" in u_content and "include" not in u_content:
        u_content = u_content.replace("from django.urls import path", "from django.urls import path, include")
    
    # Add path
    if "urlpatterns = [" in u_content:
        u_content = u_content.replace("urlpatterns = [", "urlpatterns = [\n    path('api/', include('api.urls')),")
        print("âœ… Linked 'api/' to main URLs")

with open(urls_path, "w") as f:
    f.write(u_content)

print("\nðŸŽ‰ Configuration Complete! Next Step: Install packages & Migrate.")
