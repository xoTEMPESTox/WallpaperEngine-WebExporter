import unittest
import os
import shutil
from pathlib import Path
from converter.detector import detect_wallpaper_type

class TestDetector(unittest.TestCase):

    def setUp(self):
        # Create a temporary directory for tests
        self.test_dir = Path("temp_test_detector_dir")
        self.test_dir.mkdir(exist_ok=True)

    def tearDown(self):
        # Clean up the temporary directory after tests
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_detect_video_type(self):
        # Simulate video wallpaper
        video_dir = self.test_dir / "video_wallpaper"
        video_dir.mkdir()
        (video_dir / "sample.mp4").touch()
        
        wallpaper_type, metadata = detect_wallpaper_type(video_dir)
        self.assertEqual(wallpaper_type, "video")
        self.assertIn("video_file", metadata)
        self.assertEqual(metadata["video_file"], "sample.mp4")

    def test_detect_parallax_materials_type(self):
        # Simulate parallax wallpaper with materials folder
        parallax_dir = self.test_dir / "parallax_wallpaper_materials"
        parallax_dir.mkdir()
        (parallax_dir / "materials").mkdir()
        (parallax_dir / "materials" / "image1.png").touch()
        (parallax_dir / "materials" / "image2.jpg").touch()
        
        wallpaper_type, metadata = detect_wallpaper_type(parallax_dir)
        self.assertEqual(wallpaper_type, "parallax")
        self.assertIn("image_files", metadata)
        self.assertIsInstance(metadata["image_files"], list)
        self.assertIn("image1.png", metadata["image_files"])
        self.assertIn("image2.jpg", metadata["image_files"])

    def test_detect_parallax_scene_type(self):
        # Simulate parallax wallpaper with scene.json
        import json
        parallax_scene_dir = self.test_dir / "parallax_wallpaper_scene"
        parallax_scene_dir.mkdir()
        with open(parallax_scene_dir / "scene.json", "w") as f:
            json.dump({"layers": [{"name": "layer1"}]}, f)
        
        wallpaper_type, metadata = detect_wallpaper_type(parallax_scene_dir)
        self.assertEqual(wallpaper_type, "parallax")
        self.assertIn("scene_data", metadata)
        self.assertIn("layers", metadata["scene_data"])

    def test_detect_unknown_type(self):
        # Simulate unknown wallpaper type
        unknown_dir = self.test_dir / "unknown_wallpaper"
        unknown_dir.mkdir()
        (unknown_dir / "document.txt").touch()
        
        wallpaper_type, metadata = detect_wallpaper_type(unknown_dir)
        self.assertEqual(wallpaper_type, "unknown")
        self.assertEqual(metadata, {})

    def test_input_path_does_not_exist(self):
        with self.assertRaises(FileNotFoundError):
            detect_wallpaper_type(Path("non_existent_path"))

if __name__ == '__main__':
    unittest.main()