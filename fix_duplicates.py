import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
# पिछले लॉग्स के आधार पर आपका settings.py यहाँ है
SETTINGS_PATH = os.path.join(BASE_DIR, "core", "settings.py")

if not os.path.exists(SETTINGS_PATH):
    # बैकअप लोकेशन चेक करें
    SETTINGS_PATH = os.path.join(BASE_DIR, "backend", "settings.py")

print(f"ðŸ”§ Cleaning Duplicates in: {SETTINGS_PATH}")

with open(SETTINGS_PATH, "r") as f:
    lines = f.readlines()

new_lines = []
seen_apps = set()
in_installed_apps = False

for line in lines:
    clean_line = line.strip()
    
    # Check start of INSTALLED_APPS
    if "INSTALLED_APPS = [" in line:
        in_installed_apps = True
        new_lines.append(line)
        continue

    # Check end of INSTALLED_APPS
    if in_installed_apps and "]" in clean_line:
        in_installed_apps = False
        new_lines.append(line)
        continue

    if in_installed_apps:
        # अगर यह ऐप वाली लाइन है (e.g., 'rest_framework',)
        # तो हम चेक करेंगे कि क्या यह पहले आ चुकी है
        if "'" in line or '"' in line:
            # ऐप का नाम निकालें (Quotes और Comma हटाकर)
            app_name = clean_line.replace("'", "").replace('"', "").replace(",", "")
            
            if app_name in seen_apps:
                print(f"âŒ Removing duplicate: {app_name}")
                continue # इस लाइन को skip करें (Duplicate)
            
            seen_apps.add(app_name)
    
    # बाकी सब कुछ वैसा ही रखें
    new_lines.append(line)

# फाइल को वापस सेव करें
with open(SETTINGS_PATH, "w") as f:
    f.writelines(new_lines)

print("âœ… Settings cleaned successfully!")
