import os
import zipfile

def zip_for_netlify():
    # Source is current directory
    source_dir = os.path.dirname(os.path.abspath(__file__))
    # Output zip path (save it one level up so it's not included in the zip)
    output_zip = os.path.join(os.path.dirname(source_dir), 'netlify-deploy.zip')
    
    exclude_dirs = {
        'node_modules',
        '.git',
        '.next',
        '__pycache__',
        '.system_generated'
    }
    
    # Overwrite if exists
    if os.path.exists(output_zip):
        try:
            os.remove(output_zip)
        except Exception as e:
            print(f"Could not remove existing zip: {e}")
            
    print(f"Zipping contents of '{source_dir}' for Netlify deployment...")
    print(f"Destination: {output_zip}")
    
    count = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                # Do not zip zip files, env files, or the script itself
                if file.endswith('.zip') or file == 'zip_netlify.py' or file == '.env':
                    continue
                
                full_path = os.path.join(root, file)
                # Compute relative path relative to source_dir so files are at root of zip!
                rel_path = os.path.relpath(full_path, source_dir)
                zipf.write(full_path, rel_path)
                count += 1
                
    print(f"Done! Successfully created {output_zip} containing {count} files.")
    print("You can now drag and drop 'netlify-deploy.zip' directly onto Netlify Drop to deploy!")

if __name__ == '__main__':
    zip_for_netlify()
