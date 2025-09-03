# Wallpaper Engine Web Exporter - User Guide

## Overview

The Wallpaper Engine Web Exporter is a powerful tool that converts Wallpaper Engine projects into web-compatible formats that can run in any modern browser. This guide will help you understand how to use the converter, where to find the output, and how to view your wallpapers in a browser.

## How to Run the Converter

### Prerequisites

Before running the converter, ensure you have:

1. Python 3.6 or higher installed on your system
2. Wallpaper Engine projects in the unpacked format (placed in `output/unpacked/`)

### Running the Converter

To convert your Wallpaper Engine projects to web format:

1. Place your unpacked Wallpaper Engine projects in the `output/unpacked/` directory. Each project should be in its own subdirectory with the project's ID as the folder name.

2. Navigate to the project root directory in your terminal or command prompt.

3. Run the converter script:
   ```bash
   python src/converter/convert_to_web.py
   ```

4. The converter will process all projects found in `output/unpacked/` and generate web-compatible versions in `output/web/{project_id}/`.

### Command Line Options

The converter currently runs with default settings and does not require any command line arguments.

## Finding the Output

After running the converter, you can find the web-compatible wallpapers in the following directory structure:

```
output/
└── web/
    └── {project_id}/
        ├── project.json      # Intermediate data model
        ├── assets/           # Processed media files
        │   ├── *.png/jpg     # Images
        │   ├── *.mp4/webm    # Videos
        │   ├── *.mp3/ogg     # Audio
        │   ├── particles/    # Particle system files
        │   ├── effects/      # Effect files
        │   └── shaders/      # Shader files
        ├── index.html        # Main HTML file
        ├── renderer.js       # Core rendering engine
        ├── particles.js      # Particle system implementation
        └── shaders.js        # Shader system implementation
```

Each converted project will have its own directory under `output/web/` named after the project's ID.

## Viewing the Output in a Browser

To view your converted wallpapers in a browser:

1. Navigate to the output directory of your converted project:
   ```
   output/web/{project_id}/
   ```

2. You can view the wallpaper in several ways:
   
   a. **Direct file opening**: Simply open the `index.html` file in your browser by double-clicking it or dragging it to a browser window.
   
   b. **Local web server**: For better compatibility, especially with features that require a web server, you can start a local web server:
      - Python 3: Run `python -m http.server 8000` in the project directory
      - Then open `http://localhost:8000` in your browser

3. The wallpaper should automatically start playing when the page loads.

4. For wallpapers with interactive features:
   - Move your mouse to see parallax effects
   - Click to pause/resume animations (for video wallpapers)

## Basic Troubleshooting Tips

### Common Issues and Solutions

1. **Wallpaper doesn't load or shows a blank page**:
   - Check the browser's developer console (usually F12) for error messages
   - Ensure all files were generated correctly in the output directory
   - Verify that the project.json file exists and is valid JSON

2. **Missing assets or broken images**:
   - Check that all asset files were copied to the assets directory
   - Verify that file paths in project.json match the actual file locations
   - Ensure the unpacked Wallpaper Engine project contained all necessary assets

3. **Parallax effect not working**:
   - Make sure you're moving your mouse over the wallpaper area
   - Check that the layer has parallax properties in the project.json
   - Verify that JavaScript is enabled in your browser

4. **Particle effects not visible**:
   - Check the browser console for JavaScript errors
   - Verify that particles.js is loaded correctly
   - Ensure the particle system data was properly parsed from the original project

5. **Shader effects not working**:
   - Shader support requires WebGL, which may be disabled in some browsers
   - Check that your browser supports WebGL
   - Look for WebGL-related errors in the browser console

### Browser Compatibility

The exported wallpapers should work in all modern browsers that support:
- HTML5 Canvas
- WebGL (for shader effects)
- Modern JavaScript (ES6+)

Tested browsers include:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Considerations

1. **Large wallpapers**: Complex wallpapers with many layers or high-resolution assets may perform poorly on older hardware.

2. **Browser limitations**: Some browsers may have memory or performance limitations that affect wallpaper playback.

3. **Mobile devices**: While wallpapers can run on mobile devices, performance may vary significantly.

## Next Steps

After successfully converting and viewing your wallpapers, you can:

1. Share your wallpapers by uploading the entire output directory to a web server
2. Customize the appearance by modifying the CSS in index.html
3. Extend functionality by modifying the JavaScript files
4. Explore the developer guide to understand how the converter works and how to extend it

For more advanced usage, including modifying the converter or adding new features, please refer to the Developer Guide and API Documentation.