import unittest
import os
import shutil
from pathlib import Path
from unittest.mock import patch, mock_open, MagicMock

# Import the functions to be tested
from converter.generator import generate_web_export, _generate_video_export, _generate_parallax_export

class TestGenerator(unittest.TestCase):

    def setUp(self):
        self.test_output_dir = Path("temp_output")
        self.test_input_dir = Path("temp_input")
        self.test_input_dir.mkdir(exist_ok=True)

        # Mock template file contents
        self.video_template_html = """<!DOCTYPE html>
<html lang="en">
<body>
    <video autoplay muted loop preload="auto">
        <source src="placeholder-video.mp4" type="video/mp4">
    </video>
    <!-- Content overlay if needed -->
</body>
</html>"""
        self.parallax_template_html = """<!DOCTYPE html>
<html lang="en">
<body>
    <canvas id="parallaxCanvas"></canvas>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.x.x/pixi.min.js"></script>
    <script src="script.js"></script>
</body>
</html>"""
        self.parallax_template_js = """// This script will be dynamically generated.
window.onload = () => {
    const app = new PIXI.Application({
        resizeTo: window,
        backgroundColor: 0x000000,
        antialias: true
    });
    document.body.appendChild(app.view);
    const layers = [];
    // Placeholder for dynamic image loading and parallax logic
    // Images will be loaded and added here by the serverless function.
    // Each layer will have a 'depth' property to control its movement.
    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    app.ticker.add(() => {
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const offsetX = (mouseX - centerX) * 0.005;
        const offsetY = (mouseY - centerY) * 0.005;
        layers.forEach(layer => {
            layer.x = centerX + (offsetX * layer.depth * app.screen.width);
            layer.y = centerY + (offsetY * layer.depth * app.screen.height);
        });
    });
    window.addEventListener('resize', () => {
        layers.forEach(layer => {
            layer.x = app.screen.width / 2;
            layer.y = app.screen.height / 2;
        });
    });
};"""

    def tearDown(self):
        if self.test_output_dir.exists():
            shutil.rmtree(self.test_output_dir)
        if self.test_input_dir.exists():
            shutil.rmtree(self.test_input_dir)

    @patch('shutil.copy')
    @patch('builtins.open', new_callable=mock_open)
    @patch('pathlib.Path.mkdir')
    def test_generate_video_export(self, mock_mkdir, mock_open_file, mock_shutil_copy):
        # Setup mock for reading template file
        mock_open_file.side_effect = [
            mock_open(read_data=self.video_template_html).return_value, # For reading template
            mock_open().return_value, # For writing index.html
            mock_open().return_value  # For writing readme.md
        ]
        
        video_file_name = "test_video.mp4"
        metadata = {"video_file": video_file_name, "id": "12345"}
        
        # Create a dummy video file in input dir for shutil.copy to find
        (self.test_input_dir / video_file_name).touch()

        _generate_video_export(self.test_input_dir, self.test_output_dir, metadata)

        # Assert output directory was created
        mock_mkdir.assert_called_with(parents=True, exist_ok=True)

        # Assert video file was "copied"
        mock_shutil_copy.assert_called_with(self.test_input_dir / video_file_name, self.test_output_dir / video_file_name)

        # Assert index.html was written with correct content
        written_html = mock_open_file().write.call_args_list[0].args[0]
        self.assertIn(f'<source src="{video_file_name}" type="video/mp4">', written_html)
        self.assertIn('console.log("%c WALLPAPERENGINE WEB EXPORTER "', written_html)
        self.assertIn('ID: 12345', written_html)
        self.assertIn('Type: video', written_html)
        
        # Assert readme.md was written
        written_readme = mock_open_file().write.call_args_list[1].args[0]
        self.assertIn("# Video Wallpaper Export", written_readme)

    @patch('shutil.copy')
    @patch('builtins.open', new_callable=mock_open)
    @patch('pathlib.Path.mkdir')
    @patch('pathlib.Path.is_dir', return_value=True) # Mock materials directory existing
    def test_generate_parallax_export(self, mock_is_dir, mock_mkdir, mock_open_file, mock_shutil_copy):
        # Setup mock for reading template files
        mock_open_file.side_effect = [
            mock_open(read_data=self.parallax_template_html).return_value, # For reading HTML template
            mock_open().return_value, # For writing index.html
            mock_open(read_data=self.parallax_template_js).return_value,  # For reading JS template
            mock_open().return_value, # For writing script.js
            mock_open().return_value  # For writing readme.md
        ]

        image_files = ["bg.png", "fg.png"]
        metadata = {"image_files": image_files, "id": "67890"}
        
        # Create dummy image files in input/materials dir for shutil.copy to find
        (self.test_input_dir / "materials").mkdir(exist_ok=True)
        for img in image_files:
            (self.test_input_dir / "materials" / img).touch()

        _generate_parallax_export(self.test_input_dir, self.test_output_dir, metadata)

        # Assert output directory and assets directory were created
        mock_mkdir.assert_any_call(parents=True, exist_ok=True)
        mock_mkdir.assert_any_call(exist_ok=True) # For assets_path.mkdir

        # Assert image files were "copied"
        mock_shutil_copy.assert_any_call(self.test_input_dir / "materials" / "bg.png", self.test_output_dir / "assets" / "bg.png")
        mock_shutil_copy.assert_any_call(self.test_input_dir / "materials" / "fg.png", self.test_output_dir / "assets" / "fg.png")

        # Assert index.html was written with correct content
        written_html = mock_open_file().write.call_args_list[0].args[0]
        self.assertIn('console.log("%c WALLPAPERENGINE WEB EXPORTER "', written_html)
        self.assertIn('ID: 67890', written_html)
        self.assertIn('Type: parallax', written_html)

        # Assert script.js was written with correct content
        written_js = mock_open_file().write.call_args_list[1].args[0]
        self.assertIn("const layer1 = PIXI.Sprite.from('assets/bg.png');", written_js)
        self.assertIn("layer1.depth = 0.1;", written_js)
        self.assertIn("const layer2 = PIXI.Sprite.from('assets/fg.png');", written_js)
        self.assertIn("layer2.depth = 0.2;", written_js)
        
        # Assert readme.md was written
        written_readme = mock_open_file().write.call_args_list[2].args[0]
        self.assertIn("# Parallax Wallpaper Export", written_readme)

    @patch('converter.generator._generate_video_export')
    @patch('converter.generator._generate_parallax_export')
    def test_generate_web_export_dispatcher(self, mock_parallax_export, mock_video_export):
        input_path = Path("dummy_input")
        output_path = Path("dummy_output")

        # Test video type
        generate_web_export(input_path, output_path, "video", {})
        mock_video_export.assert_called_once_with(input_path, output_path, {})
        mock_video_export.reset_mock()

        # Test parallax type
        generate_web_export(input_path, output_path, "parallax", {})
        mock_parallax_export.assert_called_once_with(input_path, output_path, {})
        mock_parallax_export.reset_mock()

        # Test unknown type
        with patch('builtins.print') as mock_print:
            generate_web_export(input_path, output_path, "unknown", {})
            mock_print.assert_called_with("Unsupported wallpaper type for generation: unknown")
        self.assertEqual(mock_video_export.call_count, 0)
        self.assertEqual(mock_parallax_export.call_count, 0)

if __name__ == '__main__':
    unittest.main()