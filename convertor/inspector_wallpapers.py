import os
import json

UNPACKED_DIR = "output/unpacked"

def inspect_wallpaper(path):
    info = {
        "name": os.path.basename(path),
        "project": None,
        "scene": None,
        "has_particles": False,
        "has_effects": False,
        "has_shaders": False,
        "materials": 0,
    }

    # project.json
    project_file = os.path.join(path, "project.json")
    if os.path.exists(project_file):
        with open(project_file, "r", encoding="utf-8") as f:
            info["project"] = json.load(f).get("title", "Unknown")

    # scene.json
    scene_file = os.path.join(path, "scene.json")
    if os.path.exists(scene_file):
        with open(scene_file, "r", encoding="utf-8") as f:
            info["scene"] = json.load(f)

    # check folders
    if os.path.isdir(os.path.join(path, "particles")):
        info["has_particles"] = True
    if os.path.isdir(os.path.join(path, "effects")):
        info["has_effects"] = True
    if os.path.isdir(os.path.join(path, "shaders")):
        info["has_shaders"] = True
    if os.path.isdir(os.path.join(path, "materials")):
        info["materials"] = len(os.listdir(os.path.join(path, "materials")))

    return info

def main():
    results = []
    for wallpaper in os.listdir(UNPACKED_DIR):
        wp_path = os.path.join(UNPACKED_DIR, wallpaper)
        if os.path.isdir(wp_path):
            info = inspect_wallpaper(wp_path)
            results.append(info)

    # Pretty print results
    for r in results:
        print("\n---")
        print(f"Wallpaper: {r['name']}")
        print(f"Title: {r['project']}")
        print(f"Particles: {r['has_particles']}, Effects: {r['has_effects']}, Shaders: {r['has_shaders']}")
        print(f"Materials: {r['materials']}")

if __name__ == "__main__":
    main()
