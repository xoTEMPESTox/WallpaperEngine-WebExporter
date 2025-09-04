import os
from pathlib import Path
import re

def validate_output(output_path: Path):
    """
    Validates the generated web export output for valid references and assets.
    Returns True if valid, False otherwise.
    """
    print(f"Validating output in {output_path}")
    if not output_path.is_dir():
        print(f"Validation Error: Output path is not a directory or does not exist: {output_path}")
        return False

    index_html_path = output_path / "index.html"
    if not index_html_path.is_file():
        print(f"Validation Error: index.html not found in output directory: {output_path}")
        return False

    with open(index_html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    is_valid = True

    # Regex to find src attributes in video, img, script tags
    src_pattern = re.compile(r'(?:<video[^>]*?src=["\']([^"\']+)["\']|<source[^>]*?src=["\']([^"\']+)["\']|<img[^>]*?src=["\']([^"\']+)["\']|<script[^>]*?src=["\']([^"\']+)["\'])')
    for match in src_pattern.finditer(html_content):
        src = next(filter(None, match.groups())) # Get the first non-None group
        if src and not src.startswith(("http://", "https://")):
            if not (output_path / src).exists():
                print(f"Validation Warning: Resource '{src}' referenced in HTML not found in output.")
                is_valid = False

    # Regex to find href attributes in link tags (for stylesheets)
    href_pattern = re.compile(r'<link[^>]*?href=["\']([^"\']+)["\'][^>]*?rel=["\']stylesheet["\']')
    for match in href_pattern.finditer(html_content):
        href = match.group(1)
        if href and not href.startswith(("http://", "https://")):
            if not (output_path / href).exists():
                print(f"Validation Warning: Stylesheet '{href}' referenced in HTML not found in output.")
                is_valid = False

    if is_valid:
        print("Output validated successfully: No broken references found.")
    else:
        print("Output validation completed with warnings/errors.")

    return is_valid

if __name__ == "__main__":
    import shutil
    # Example usage (for testing purposes)
    # Create dummy output directory and files for testing validation
    test_output_valid = Path("test_output_valid")
    test_output_valid.mkdir(exist_ok=True)
    with open(test_output_valid / "index.html", "w") as f:
        f.write("""
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <video controls><source src="video.mp4"></video>
    <img src="image.png">
    <script src="script.js"></script>
    <script src="https://example.com/external.js"></script>
</body>
</html>
""")
    (test_output_valid / "video.mp4").touch()
    (test_output_valid / "image.png").touch()
    (test_output_valid / "script.js").touch()
    (test_output_valid / "style.css").touch()
    print(f"Validation for '{test_output_valid}': {validate_output(test_output_valid)}")
    shutil.rmtree(test_output_valid)

    test_output_invalid = Path("test_output_invalid")
    test_output_invalid.mkdir(exist_ok=True)
    with open(test_output_invalid / "index.html", "w") as f:
        f.write("""
<!DOCTYPE html>
<html>
<body>
    <video controls><source src="missing_video.mp4"></video>
    <img src="missing_image.png">
    <script src="missing_script.js"></script>
</body>
</html>
""")
    print(f"Validation for '{test_output_invalid}': {validate_output(test_output_invalid)}")
    shutil.rmtree(test_output_invalid)

    test_output_no_html = Path("test_output_no_html")
    test_output_no_html.mkdir(exist_ok=True)
    print(f"Validation for '{test_output_no_html}': {validate_output(test_output_no_html)}")
    shutil.rmtree(test_output_no_html)