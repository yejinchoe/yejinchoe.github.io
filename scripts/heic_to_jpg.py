import os
from PIL import Image
from pillow_heif import register_heif_opener

# This allows Pillow to recognize and open HEIC files
register_heif_opener()

def convert_heic_to_jpg(directory_path):
    # Ensure the path exists
    if not os.path.exists(directory_path):
        print(f"Error: The directory {directory_path} does not exist.")
        return

    # Loop through all files in the directory
    for filename in os.listdir(directory_path):
        if filename.lower().endswith(".heic"):
            heic_path = os.path.join(directory_path, filename)
            
            # Create the output filename (replace .heic with .jpg)
            jpg_filename = os.path.splitext(filename)[0] + ".jpg"
            jpg_path = os.path.join(directory_path, jpg_filename)

            try:
                # Open and convert
                with Image.open(heic_path) as image:
                    # HEIC can be in CMYK or have transparency; convert to RGB for JPG
                    image = image.convert("RGB")
                    image.save(jpg_path, "JPEG", quality=90)
                
                print(f"Successfully converted: {filename} -> {jpg_filename}")
                
                # Optional: Uncomment the line below if you want to delete the original .heic
                os.remove(heic_path)

            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

# --- Usage ---
folder_path = input("Enter the path to the directory: ")
convert_heic_to_jpg(folder_path)