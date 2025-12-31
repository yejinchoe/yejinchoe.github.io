import os
from PIL import Image
from PIL.ExifTags import TAGS
from pillow_heif import register_heif_opener

# Enable HEIC support for iPhone photos
register_heif_opener()

def get_date_taken(path):
    """Extracts the date the photo was taken from EXIF data."""
    try:
        with Image.open(path) as img:
            exif = img.getexif()
            if exif:
                for tag, value in exif.items():
                    tag_name = TAGS.get(tag, tag)
                    if tag_name == "DateTimeOriginal" or tag == 36867:
                        return value
    except Exception:
        pass
    
    # Fallback to file creation time
    return os.path.getctime(path)

def sort_and_rename_clean(directory_path):
    if not os.path.exists(directory_path):
        print("Error: Directory not found.")
        return

    valid_extensions = ('.jpg', '.jpeg', '.png', '.heic')
    image_list = []

    # 1. Scan and collect data
    files = [f for f in os.listdir(directory_path) if f.lower().endswith(valid_extensions)]
    
    for filename in files:
        full_path = os.path.join(directory_path, filename)
        date_taken = get_date_taken(full_path)
        image_list.append({
            'current_path': full_path,
            'date': date_taken,
            'ext': os.path.splitext(filename)[1].lower()
        })

    # 2. Sort from Oldest to Newest
    image_list.sort(key=lambda x: x['date'])

    # 3. Rename to TEMP names first
    # This prevents "File Already Exists" errors
    print(f"Phase 1: Moving {len(image_list)} files to temporary names...")
    temp_files = []
    for i, img_data in enumerate(image_list, start=1):
        temp_name = f"temp_{i}{img_data['ext']}"
        temp_path = os.path.join(directory_path, temp_name)
        os.rename(img_data['current_path'], temp_path)
        temp_files.append((temp_path, img_data['ext']))

    # 4. Rename from TEMP to FINAL names
    print("Phase 2: Finalizing names (IMAGE_1, IMAGE_2...)...")
    for i, (temp_path, ext) in enumerate(temp_files, start=1):
        final_name = f"IMAGE_{i}{ext}"
        final_path = os.path.join(directory_path, final_name)
        os.rename(temp_path, final_path)

    print(f"\nSuccess! Sorted and renamed {len(image_list)} images.")

# --- Run ---
folder = input("Enter the directory path: ")
sort_and_rename_clean(folder)