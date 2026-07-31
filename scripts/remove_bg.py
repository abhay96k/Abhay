import sys
import os
import subprocess

def main():
    # Attempt to import rembg, install if missing
    try:
        from rembg import remove
    except ImportError:
        print("Installing rembg and requirements...")
        # On some systems, pip needs to install rembg
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg", "pillow", "onnxruntime"])
        from rembg import remove

    from PIL import Image

    # Paths
    src_path = r"C:\Users\VIJAY CHAVAN\.gemini\antigravity-ide\brain\394e4d2c-7a16-41bb-a189-d945f09ccd16\media__1785419754091.jpg"
    out_dir = r"c:\Users\VIJAY CHAVAN\Documents\Abhay\src\assets"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "abhay-profile.png")

    if not os.path.exists(src_path):
        print(f"Source file not found at {src_path}")
        sys.exit(1)

    print(f"Loading {src_path} and extracting background...")
    try:
        with open(src_path, 'rb') as f:
            input_img = f.read()
            output_img = remove(input_img)
            with open(out_path, 'wb') as out_f:
                out_f.write(output_img)
        print(f"Success! Saved transparent PNG to: {out_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
