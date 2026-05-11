import os
from PIL import Image

IMAGES_DIR = "images"
TARGETS = {
    "widgets.png": [1200, 800, 480],
    "dashboard.png": [1200, 800, 480],
    "mobile-screenshots-collage.png": [800, 480],
    "logo.png": [] # Just convert to WebP
}

def optimize():
    results = {}
    
    for filename, widths in TARGETS.items():
        filepath = os.path.join(IMAGES_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Skipping {filename}, not found.")
            continue
            
        with Image.open(filepath) as img:
            # Get original dimensions
            orig_w, orig_h = img.size
            results[filename] = {"orig_w": orig_w, "orig_h": orig_h, "generated": []}
            
            # 1. Convert Original to WebP
            webp_path = os.path.splitext(filepath)[0] + ".webp"
            img.save(webp_path, "WEBP", quality=85)
            results[filename]["generated"].append(webp_path)
            
            # 2. Generate Resized WebPs
            for w in widths:
                if w >= orig_w: continue # Don't upscale
                
                ratio = w / orig_w
                h = int(orig_h * ratio)
                
                resized_img = img.resize((w, h), Image.Resampling.LANCZOS)
                
                base_name = os.path.splitext(filename)[0]
                new_filename = f"{base_name}-{w}w.webp"
                new_path = os.path.join(IMAGES_DIR, new_filename)
                
                resized_img.save(new_path, "WEBP", quality=85)
                results[filename]["generated"].append(new_path)
                
    print("Optimization Complete.")
    for f, data in results.items():
        print(f"Image: {f} ({data['orig_w']}x{data['orig_h']})")

if __name__ == "__main__":
    optimize()
