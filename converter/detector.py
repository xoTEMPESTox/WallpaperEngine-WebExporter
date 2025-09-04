import os
import json
from pathlib import Path

def detect_wallpaper_type(input_path: Path):
    """
    Detects the type of wallpaper based on the files present in the input_path.
    Returns the detected type and relevant metadata.
    """
    if not input_path.exists():
        raise FileNotFoundError(f"Input path does not exist: {input_path}")

    # Check for video wallpaper
    video_files = list(input_path.glob("*.mp4")) + list(input_path.glob("*.webm"))
    if video_files:
        return "video", {"video_file": str(video_files[0].name)}

    # Check for parallax wallpaper
    materials_path = input_path / "materials"
    if materials_path.is_dir():
        image_files = [f for f in materials_path.iterdir() if f.suffix.lower() in [".png", ".jpg", ".jpeg", ".gif", ".bmp"]]
        if len(image_files) >= 2:
            return "parallax", {"image_files": [str(f.name) for f in image_files]}

    # Check for scene.json for parallax hints
    scene_json_path = input_path / "scene.json"
    if scene_json_path.is_file():
        try:
            with open(scene_json_path, 'r', encoding='utf-8') as f:
                scene_data = json.load(f)
            if "layers" in scene_data:
                return "parallax", {"scene_data": scene_data}
        except json.JSONDecodeError:
            pass # Malformed JSON, ignore for detection

    # Hybrid (placeholder for future phases)
    # Add stubs for particles/effects/shaders presence (Phase 3).
    # if input_path.glob("*.json") and input_path.glob("*.glsl"): # Example for hybrid
    #     return "hybrid", {}

    return "unknown", {}

if __name__ == "__main__":
    # Example usage (for testing purposes)
    # Create dummy files for testing
    test_dir_video = Path("test_wallpaper_video")
    test_dir_video.mkdir(exist_ok=True)
    (test_dir_video / "video.mp4").touch()
    print(f"Detected type for '{test_dir_video}': {detect_wallpaper_type(test_dir_video)}")
    os.remove(test_dir_video / "video.mp4")
    test_dir_video.rmdir()

    test_dir_parallax_materials = Path("test_wallpaper_parallax_materials")
    test_dir_parallax_materials.mkdir(exist_ok=True)
    (test_dir_parallax_materials / "materials").mkdir(exist_ok=True)
    (test_dir_parallax_materials / "materials" / "image1.png").touch()
    (test_dir_parallax_materials / "materials" / "image2.jpg").touch()
    print(f"Detected type for '{test_dir_parallax_materials}': {detect_wallpaper_type(test_dir_parallax_materials)}")
    os.remove(test_dir_parallax_materials / "materials" / "image1.png")
    os.remove(test_dir_parallax_materials / "materials" / "image2.jpg")
    (test_dir_parallax_materials / "materials").rmdir()
    test_dir_parallax_materials.rmdir()

    test_dir_parallax_scene = Path("test_wallpaper_parallax_scene")
    test_dir_parallax_scene.mkdir(exist_ok=True)
    with open(test_dir_parallax_scene / "scene.json", "w") as f:
        json.dump({"layers": []}, f)
    print(f"Detected type for '{test_dir_parallax_scene}': {detect_wallpaper_type(test_dir_parallax_scene)}")
    os.remove(test_dir_parallax_scene / "scene.json")
    test_dir_parallax_scene.rmdir()

    test_dir_unknown = Path("test_wallpaper_unknown")
    test_dir_unknown.mkdir(exist_ok=True)
    (test_dir_unknown / "text.txt").touch()
    print(f"Detected type for '{test_dir_unknown}': {detect_wallpaper_type(test_dir_unknown)}")
    os.remove(test_dir_unknown / "text.txt")
    test_dir_unknown.rmdir()