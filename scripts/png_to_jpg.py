import os
from PIL import Image

def convert_png_to_jpg(directory_path):
    # Ensure the path exists
    if not os.path.exists(directory_path):
        print(f"Error: The directory {directory_path} does not exist.")
        return

    # Loop through all files in the directory
    for filename in os.listdir(directory_path):
        if filename.lower().endswith(".png"):
            png_path = os.path.join(directory_path, filename)
            
            # Create the output filename (replace .png with .jpg)
            jpg_filename = os.path.splitext(filename)[0] + ".jpg"
            jpg_path = os.path.join(directory_path, jpg_filename)

            try:
                with Image.open(png_path) as image:
                    # Handle transparency: 
                    # If image has an alpha channel (RGBA), paste it onto a white background
                    if image.mode in ("RGBA", "P"):
                        background = Image.new("RGB", image.size, (255, 255, 255))
                        background.paste(image, mask=image.split()[3] if image.mode == "RGBA" else None)
                        image = background
                    else:
                        image = image.convert("RGB")
                    
                    # Save as JPEG
                    image.save(jpg_path, "JPEG", quality=90)
                
                print(f"Successfully converted: {filename} -> {jpg_filename}")
                
                # Optional: Delete original .png
                os.remove(png_path)

            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

# --- Usage ---
folder_path = input("Enter the path to the directory: ")
convert_png_to_jpg(folder_path)