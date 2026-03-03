import os

extensions = ('.py', '.js', '.jsx', '.html', '.css', '.ts', '.tsx') 
output_file = 'all_my_code.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        if any(ignored in root for ignored in ['venv', 'env', '.git', 'node_modules', '__pycache__', 'migrations']):
            continue
            
        for file in files:
            if file.endswith(extensions):
                filepath = os.path.join(root, file)
                
                outfile.write(f"\n\n{'='*60}\n")
                outfile.write(f"📂 FILE LOCATION: {filepath}\n")
                outfile.write(f"{'='*60}\n\n")
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"⚠️ Error reading file: {e}\n")

print(f"✅ Magic done! Saara code '{output_file}' mein save ho gaya hai!")
