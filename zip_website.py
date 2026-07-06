import os
import zipfile

def zip_website_folder():
    source_dir = 'website'
    zip_filename = 'website.zip'
    
    # Remove existing zip if it exists
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    print(f"Packaging '{source_dir}' into '{zip_filename}'...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate relative path
                rel_path = os.path.relpath(file_path, source_dir)
                # Force forward slashes in ZIP headers
                archive_name = rel_path.replace(os.sep, '/')
                zipf.write(file_path, archive_name)
                print(f" Added: {archive_name}")
                
    print(f"Successfully created: {zip_filename}")

if __name__ == '__main__':
    zip_website_folder()
