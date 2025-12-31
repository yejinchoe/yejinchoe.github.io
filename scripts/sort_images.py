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
    
    # Fallback to file creation time if EXIF metadata is missing
    return os.path.getctime(path)

def sort_and_rename_newest_to_oldest(directory_path):
    if not os.path.exists(directory_path):
        print("Error: Directory not found.")
        return

    valid_extensions = ('.jpg', '.jpeg', '.png', '.heic')
    image_list = []

    # 1. Scan the directory and collect image metadata
    files = [f for f in os.listdir(directory_path) if f.lower().endswith(valid_extensions)]
    
    if not files:
        print("No valid images found in the directory.")
        return

    for filename in files:
        full_path = os.path.join(directory_path, filename)
        date_taken = get_date_taken(full_path)
        image_list.append({
            'current_path': full_path,
            'date': date_taken,
            'ext': os.path.splitext(filename)[1].lower()
        })

    # 2. Sort: Newest to Oldest (reverse=True)
    # The highest date value (most recent) will be index 0
    image_list.sort(key=lambda x: x['date'], reverse=True)

    # 3. Phase One: Rename all to generic TEMP names
    # This clears the namespace (e.g., if IMAGE_1 already exists)
    print(f"Phase 1: Moving {len(image_list)} files to temporary names...")
    temp_files = []
    for i, img_data in enumerate(image_list, start=1):
        temp_name = f"temp_{i}_moving{img_data['ext']}"
        temp_path = os.path.join(directory_path, temp_name)
        os.rename(img_data['current_path'], temp_path)
        temp_files.append((temp_path, img_data['ext']))

    # 4. Phase Two: Finalize names as IMAGE_1, IMAGE_2...
    print("Phase 2: Finalizing names (IMAGE_1 = Newest)...")
    for i, (temp_path, ext) in enumerate(temp_files, start=1):
        final_name = f"IMAGE_{i}{ext}"
        final_path = os.path.join(directory_path, final_name)
        os.rename(temp_path, final_path)
        print(f"Finalized: {final_name}")

    print(f"\nDone! Successfully renamed {len(image_list)} images.")

# --- Execution ---
folder = input("Enter the directory path: ")
sort_and_rename_newest_to_oldest(folder)