import os

# --- CONFIGURATION ---
# इन फाइल्स को ढूंढेंगे (Backend & Frontend)
TARGET_EXTENSIONS = {'.py', '.js', '.jsx', '.css'}

# इन फोल्डर्स को इग्नोर करेंगे (ताकि कचरा न दिखे)
SKIP_DIRS = {
    'node_modules', 'venv', 'env', '.git', '__pycache__', 
    'migrations', 'dist', 'build', 'assets', 'static', 'media'
}

base_dir = os.getcwd()
print(f"\nðŸ”Ž STARTING FULL PROJECT SCAN IN: {base_dir}\n")

for root, dirs, files in os.walk(base_dir):
    # फालतू फोल्डर्स को लिस्ट से हटाओ
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    
    for file in files:
        if any(file.endswith(ext) for ext in TARGET_EXTENSIONS):
            filepath = os.path.join(root, file)
            
            # सिर्फ काम की फाइल्स दिखाओ (manage.py वगैरह छोड़ सकते हैं अगर चाहे तो)
            if "manage.py" in file: continue 

            print(f"\n{'='*80}")
            print(f"ðŸ“„ FILE: {filepath}")
            print(f"{'='*80}\n")
            
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if content.strip():
                        print(content)
                    else:
                        print("[EMPTY FILE]")
            except Exception as e:
                print(f"âŒ Error reading file: {e}")

print("\nâœ… SCAN COMPLETE!")
