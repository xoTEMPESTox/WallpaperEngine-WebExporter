import unittest
import subprocess
import os
import shutil
from pathlib import Path

class TestIntegration(unittest.TestCase):

    def setUp(self):
        self.test_input_dir = Path("test_samples/video_sample")
        self.test_output_base_dir = Path("temp_integration_output")
        
        # Ensure input sample exists (created in previous step)
        self.test_input_dir.mkdir(parents=True, exist_ok=True)
        (self.test_input_dir / "sample.mp4").touch()

        # Clean up any previous test output
        if self.test_output_base_dir.exists():
            shutil.rmtree(self.test_output_base_dir)
        self.test_output_base_dir.mkdir(exist_ok=True)

    def tearDown(self):
        if self.test_input_dir.exists():
            shutil.rmtree(self.test_input_dir)
        if self.test_output_base_dir.exists():
            shutil.rmtree(self.test_output_base_dir)

    def test_orchestrator_video_conversion(self):
        # Define the command to run the orchestrator
        command = [
            "python", 
            "converter/orchestrator.py",
            "--input", str(self.test_input_dir),
            "--out", str(self.test_output_base_dir)
        ]

        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True, check=False)

        # Assert that the command ran successfully (exit code 0)
        self.assertEqual(result.returncode, 0, f"Orchestrator failed with error:\n{result.stderr}\nOutput:\n{result.stdout}")

        # Find the dynamically created output directory
        # It will be something like web_video_sample_xxxx
        generated_output_dirs = [d for d in self.test_output_base_dir.iterdir() if d.is_dir() and d.name.startswith("web_")]
        self.assertEqual(len(generated_output_dirs), 1, "Expected exactly one generated output directory.")
        
        output_dir = generated_output_dirs[0]

        # Assert expected files exist in the output directory
        self.assertTrue((output_dir / "index.html").is_file())
        self.assertTrue((output_dir / "readme.md").is_file())
        self.assertTrue((output_dir / "sample.mp4").is_file())
        self.assertTrue((output_dir / "debug.json").is_file()) # Orchestrator always writes debug.json

        print(f"Integration test successful. Output generated at: {output_dir}")

if __name__ == '__main__':
    unittest.main()