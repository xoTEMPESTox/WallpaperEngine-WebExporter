import os
import subprocess

INPUT_DIR = "assets/To_convert"
OUTPUT_DIR = "output/unpacked"
REPKG_EXE = os.path.abspath("repkg.exe")  # use local exe

def unpack_with_repkg(pkg_file, out_dir):
    cmd = [
        REPKG_EXE, "extract",
        "-c",   # copy project.json + preview
        "-t",   # convert TEX to PNG
        "-o", out_dir,  # output dir
        pkg_file
    ]
    print(f"[+] Running: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

def process_all():
    for wallpaper in os.listdir(INPUT_DIR):
        wp_pkg = os.path.join(INPUT_DIR, wallpaper, "scene.pkg")
        if os.path.exists(wp_pkg):
            out_dir = os.path.join(OUTPUT_DIR, wallpaper)
            os.makedirs(out_dir, exist_ok=True)
            unpack_with_repkg(wp_pkg, out_dir)
        else:
            print(f"[!] No scene.pkg found in {wallpaper}")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    process_all()
