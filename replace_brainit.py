import os

replacements = {
    'window.BRAINIT_DATA': 'window.CODICRAFT_DATA',
    'window.BRAINIT_DATA ||': 'window.CODICRAFT_DATA ||',
    'BRAINIT_DATA': 'CODICRAFT_DATA',
    'BrainIT': 'CodiCraft',
    'brainit': 'codicraft',
    'Brainit': 'Codicraft',
    'BRAINIT': 'CODICRAFT'
}

def replace_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        original_content = content
        for search, replace in replacements.items():
            content = content.replace(search, replace)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
    except Exception as e:
        print(f"Error on {file_path}: {e}")

def main():
    source_dir = 'website'
    print("Starting search and replace of 'brainit' -> 'codicraft'...")
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.endswith(('.html', '.js', '.css', '.json')):
                replace_in_file(os.path.join(root, file))
    print("Finished search and replace.")

if __name__ == '__main__':
    main()
