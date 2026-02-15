import os

# जिस फाइल में कोड सेव होगा
OUTPUT_FILE = "full_project_code.txt"

# इन फाइल्स को ढूंढेंगे
TARGET_EXTENSIONS = {'.py', '.js', '.jsx', '.css'}

# इन फोल्डर्स को छोड़ देंगे
SKIP_DIRS = {
    'node_modules', 'venv', 'env', '.git', '__pycache__', 
    'migrations', 'dist', 'build', 'assets', 'static', 'media', 'images'
}

base_dir = os.getcwd()
print(f"ðŸ”Ž Scanning project... saving to {OUTPUT_FILE}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as out_f:
    for root, dirs, files in os.walk(base_dir):
        # फालतू फोल्डर्स हटाओ
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in TARGET_EXTENSIONS):
                # Script file को ही कॉपी न करे
                if file == "save_project_code.py" or file == "full_project_code.txt": continue
                
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        # Header Write करो
                        out_f.write(f"\n{'='*80}\n")
                        out_f.write(f"FILE: {filepath}\n")
                        out_f.write(f"{'='*80}\n")
                        
                        if content.strip():
                            out_f.write(content + "\n")
                        else:
                            out_f.write("[EMPTY FILE]\n")
                            
                except Exception as e:
                    out_f.write(f"\n[ERROR READING FILE: {e}]\n")

print(f"\nâœ… SUCCESS! Sara code '{OUTPUT_FILE}' me save ho gaya hai.")
print("ðŸ“‚ Ab aap wo file yahan upload kar sakte hain.")
