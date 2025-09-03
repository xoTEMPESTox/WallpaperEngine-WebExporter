# Wallpaper Engine Web Exporter - Architecture Design

This document outlines the proposed architecture for the Wallpaper Engine Web Exporter, designed to evolve it into a powerful tool for replicating native wallpaper features in a web format.

## 1. Project Structure

A modular project structure is crucial for maintainability and scalability. The following directory layout is proposed:

```
/
├── converter/
│   ├── __init__.py
│   ├── main.py             # Main script to run the conversion process
│   ├── project_parser.py   # Parses Wallpaper Engine project files (project.json)
│   ├── asset_processor.py  # Handles asset copying, scaling, and optimization
│   └── data_builder.py     # Constructs the intermediate JSON data model
│
├── web_renderer/
│   ├── src/
│   │   ├── main.js             # Entry point for the web rendering engine
│   │   ├── renderer.js         # Core rendering logic (e.g., using Pixi.js or Three.js)
│   │   ├── layer.js            # Class/module for handling individual layers
│   │   ├── effect_manager.js   # Manages and applies effects (parallax, etc.)
│   │   └── asset_loader.js     # Handles loading of assets in the browser
│   ├── dist/
│   │   └── renderer.bundle.js  # Bundled and minified renderer code
│   └── package.json          # Dependencies for the web renderer (e.g., webpack, pixi.js)
│
├── templates/
│   ├── index.html          # HTML template for the web output
│   └── style.css           # Basic CSS for the output
│
├── output/
│   └── [project_id]/       # Each converted project gets its own directory
│       ├── project.json    # The intermediate data model for this project
│       ├── assets/         # All assets for the project
│       └── index.html      # The final, viewable web wallpaper
│
└── docs/
    ├── architecture_design.md
    └── development_roadmap.md
```

## 2. Data Model (Intermediate Representation)

An intermediate JSON `project.json` file will serve as the bridge between the Python converter and the JavaScript web renderer. This file will contain a structured representation of the wallpaper.

**Example `project.json`:**

```json
{
  "projectInfo": {
    "name": "My Awesome Wallpaper",
    "id": "123456789",
    "file": "scene.json",
    "preview": "preview.jpg"
  },
  "assets": {
    "images": {
      "background": "assets/background.png",
      "foreground": "assets/foreground.png"
    },
    "videos": {},
    "models": {}
  },
  "layers": [
    {
      "name": "Background Layer",
      "type": "image",
      "asset_key": "background",
      "transform": {
        "position": [0, 0, 0],
        "scale": [1, 1],
        "rotation": 0
      },
      "effects": []
    },
    {
      "name": "Foreground Layer",
      "type": "image",
      "asset_key": "foreground",
      "transform": {
        "position": [100, 50, 10],
        "scale": [0.8, 0.8],
        "rotation": 0
      },
      "effects": [
        {
          "name": "parallax",
          "intensity": 1.5,
          "depth": 10
        }
      ]
    }
  ],
  "userProperties": {}
}
```

**Particle System Layer Example:**

```json
{
  "name": "Particle Layer",
  "type": "particles",
  "particleSettings": {
    "emissionRate": 50,
    "lifetime": 2,
    "velocity": {
      "x": 0,
      "y": -50
    },
    "color": "#FF5500",
    "size": 2,
    "spread": 10
  },
  "transform": {
    "position": [400, 300, 0],
    "scale": [1, 1],
    "rotation": 0
  },
  "effects": []
}
```

**Shader Layer Example:**

```json
{
  "name": "Shader Layer",
  "type": "shader",
  "shader": {
    "vertexShader": "shaders/basic.vert",
    "fragmentShader": "shaders/basic.frag",
    "uniforms": {
      "u_time": { "type": "float", "value": 0.0 },
      "u_resolution": { "type": "vec2", "value": [800, 600] },
      "u_color": { "type": "vec3", "value": [1.0, 0.0, 0.0] }
    }
  },
  "transform": {
    "position": [0, 0, 0],
    "scale": [1, 1],
    "rotation": 0
  },
  "effects": []
}
```

## 3. Asset Handling Strategy

To prevent distortion and manage assets effectively:

1.  **Centralized Asset Directory:** All project assets will be copied into an `assets/` subdirectory within the specific project's output folder.
2.  **Maintain Aspect Ratio:** The rendering engine will be responsible for scaling assets. Instead of stretching, it will use techniques like "object-fit: cover" for images/videos or calculate scaling factors to ensure the aspect ratio is preserved while filling the designated area.
3.  **Resolution Variants (Future):** For optimization, the converter could generate multiple resolutions of an asset, and the renderer could load the most appropriate one based on the viewport size.

## 4. Rendering Strategy

The web renderer will be responsible for interpreting the `project.json` and rendering the wallpaper.

1.  **Multi-Layer Rendering:** The renderer will iterate through the `layers` array. For each layer, it will create a rendering object (e.g., a `Sprite` in Pixi.js). The order in the array determines the z-index.
2.  **Parallax Effect:**
    *   The `effect_manager` will listen for mouse movement.
    *   For each layer with a `parallax` effect, it will calculate a positional offset based on the mouse coordinates and the layer's `depth` and `intensity` properties.
    *   The formula will be `offsetX = (mouseX - centerX) * depth * intensity`.
    *   This offset will be applied to the layer's transform, creating the illusion of depth.
3.  **Rendering Library:** A 2D/3D rendering library like **Pixi.js** or **Three.js** is highly recommended. Pixi.js is excellent for 2D layer-based scenes and has strong performance, making it a good starting point. Three.js would be necessary for more complex 3D scenes and shaders.
