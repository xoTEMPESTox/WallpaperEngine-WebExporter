# Wallpaper Engine Web Exporter - Developer Guide

## Project Structure Overview

The Wallpaper Engine Web Exporter follows a modular architecture designed for extensibility and maintainability. Here's the directory structure:

```
/
├── src/
│   ├── converter/
│   │   └── convert_to_web.py    # Main conversion logic
│   └── engine/
│       ├── renderer.js          # Core rendering engine
│       ├── particles.js         # Particle system implementation
│       └── shaders.js           # Shader system implementation
├── templates/
│   └── index.html               # HTML template for web output
├── output/
│   ├── unpacked/                # Unpacked Wallpaper Engine projects (input)
│   └── web/                     # Converted web projects (output)
└── docs/
    ├── user_guide.md            # User guide
    └── developer_guide.md       # This document
```

## How Data Flows from Wallpaper Engine to Web Output

The conversion process follows these steps:

1. **Input**: Unpacked Wallpaper Engine projects are placed in `output/unpacked/{project_id}/`
2. **Parsing**: The converter reads `project.json` or `scene.json` from the project directory
3. **Processing**: Assets are processed and copied to the output directory
4. **Data Model**: An intermediate JSON data model (`project.json`) is created
5. **Web Generation**: HTML, JavaScript, and asset files are generated
6. **Output**: Complete web-compatible project is placed in `output/web/{project_id}/`

### Data Flow Diagram

```
Wallpaper Engine Project
        ↓
[convert_to_web.py]
        ↓
Intermediate Data Model (project.json)
        ↓
[renderer.js, particles.js, shaders.js]
        ↓
Web Browser
```

## Core Components

### Converter (Python)

The converter (`src/converter/convert_to_web.py`) is responsible for:

1. Reading Wallpaper Engine project files
2. Parsing layer information and assets
3. Creating the intermediate data model
4. Copying assets to the output directory
5. Generating web-compatible files

Key functions include:
- `convert_wallpaper_engine_project()`: Main conversion function
- `parse_particle_settings()`: Parses particle system settings
- `parse_position()` and `parse_scale()`: Parse transformation data

### Rendering Engine (JavaScript)

The rendering engine consists of three main components:

1. **Renderer** (`src/engine/renderer.js`): Core rendering logic with `Scene` and `Layer` classes
2. **Particles** (`src/engine/particles.js`): Particle system implementation
3. **Shaders** (`src/engine/shaders.js`): WebGL shader system

## How to Add a New Layer Type

To add support for a new layer type:

1. **Modify the Converter**:
   - Add parsing logic in `convert_wallpaper_engine_project()` 
   - Create a new section to handle your layer type
   - Add the layer data to the intermediate `project.json` model

2. **Extend the Renderer**:
   - Modify the `Layer` class in `renderer.js` to handle your new layer type
   - Add any necessary rendering logic
   - Update the `Scene` class if needed to initialize your layer type

3. **Update the Data Model**:
   - Document the new layer type structure in the `project.json` schema

### Example Implementation

```python
# In convert_to_web.py
# Add a new section in convert_wallpaper_engine_project()
elif "new_layer_type" in we_layer:
    new_layer = {
        "name": we_layer.get("name", f"New Layer {i}"),
        "type": "new_layer_type",
        "custom_properties": we_layer.get("custom_properties", {}),
        "transform": {
            "position": parse_position(we_layer.get("origin", "0 0 0")),
            "scale": parse_scale(we_layer.get("scale", "1 1 1")),
            "rotation": 0,
        },
        "effects": [],
    }
    new_project_data["layers"].append(new_layer)
```

```javascript
// In renderer.js
// Modify the Layer class constructor
if (this.layerData.type === 'new_layer_type') {
    this.element = this.createCustomElement();
} else if (this.layerData.type === 'particles') {
    // ... existing code
}

// Add a new method to handle your layer type
createCustomElement() {
    // Create and configure DOM elements for your new layer type
    const element = document.createElement('div');
    // ... custom implementation
    return element;
}
```

## How to Add a New Effect

To add support for a new effect:

1. **Modify the Converter**:
   - Update the effect parsing logic in `convert_wallpaper_engine_project()`
   - Add the effect data to the layer's `effects` array in `project.json`

2. **Extend the Renderer**:
   - Modify the `Layer.update()` method to apply your new effect
   - Add any necessary effect-specific logic

3. **Update Documentation**:
   - Document the new effect in the API documentation

### Example Implementation

```javascript
// In renderer.js
// Modify the Layer.update() method
update(deltaTime, offsetX, offsetY) {
    // ... existing code
    
    // Apply custom effect
    const customEffect = this.getCustomEffect();
    if (customEffect) {
        this.applyCustomEffect(customEffect);
    }
}

getCustomEffect() {
    if (this.layerData.effects) {
        return this.layerData.effects.find(effect => effect.name === 'custom_effect');
    }
    return null;
}

applyCustomEffect(effect) {
    // Apply your custom effect logic
    if (this.element) {
        // ... effect implementation
    }
}
```

## Coding Conventions and Style

### Python Style (Converter)

- Follow PEP 8 style guide
- Use 4 spaces for indentation (no tabs)
- Use descriptive variable and function names
- Include docstrings for all functions
- Keep lines under 88 characters (Black default)
- Use type hints where appropriate

### JavaScript Style (Engine)

- Use ES6+ features (classes, const/let, arrow functions)
- Use camelCase for variables and functions
- Include JSDoc comments for classes and functions
- Use descriptive names for classes and methods
- Keep lines under 80 characters
- Use modules for organization (currently using global exports)

### Data Model Conventions

- Use consistent naming conventions in JSON data models
- Document all fields in the API documentation
- Use arrays for ordered data and objects for keyed data
- Include default values for optional fields

## Extending the Particle System

To extend the particle system:

1. **Modify Particle Class**:
   - Add new properties to the `Particle` class in `particles.js`
   - Update the `update()` and `render()` methods

2. **Modify ParticleSystem Class**:
   - Add new configuration options to the `ParticleSystem` class
   - Update the `emitParticle()` method for new particle types

3. **Update Converter**:
   - Modify `parse_particle_settings()` to handle new particle properties
   - Update the particle layer data in `project.json`

## Extending the Shader System

To extend the shader system:

1. **Modify ShaderProgram Class**:
   - Add new uniform handling methods to `ShaderProgram` in `shaders.js`
   - Add new shader compilation options

2. **Update Renderer**:
   - Modify `renderShaderLayer()` in `renderer.js` to handle new shader types
   - Add new shader loading logic

3. **Update Converter**:
   - Modify shader parsing logic in `convert_to_web.py`
   - Update shader data in `project.json`

## Testing Your Changes

1. **Unit Testing**: Run the unit tests with the following command:
   ```bash
   python -m unittest tests.test_converter
   ```
   
   To run tests with more verbose output:
   ```bash
   python -m unittest tests.test_converter -v
   ```

2. **Integration Testing**: Test with various Wallpaper Engine projects
3. **Browser Testing**: Verify output works in multiple browsers
4. **Performance Testing**: Check for memory leaks and performance issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Update documentation
6. Submit a pull request

## Debugging Aids

### Python Converter Debugging

The converter scripts (`convert_to_web.py` and `debug_converter.py`) support a `--verbose` flag that provides detailed logging information during the conversion process:

```bash
python src/converter/convert_to_web.py --verbose
```

This will output detailed information about:
- Which projects are being processed
- How assets are being copied
- What layer types are being handled
- Any errors or warnings encountered

### JavaScript Engine Debugging

The JavaScript engine (renderer.js, particles.js, and shaders.js) includes a simple debugging mechanism. To enable it:

1. Open each of the JavaScript files in `src/engine/`
2. Change the `DEBUG` constant from `false` to `true`:
   ```javascript
   const DEBUG = true;
   ```

When enabled, the engine will output detailed logging information to the browser's console, including:
- Scene and layer initialization
- Particle system updates
- Shader compilation and linking
- Rendering operations

## Future Enhancement Areas

1. **Performance Improvements**:
   - Optimize asset processing
   - Improve rendering performance
   - Add caching mechanisms

2. **Feature Expansion**:
   - Support for more Wallpaper Engine layer types
   - Additional particle system features
   - Advanced shader support

3. **Tooling Improvements**:
   - Implement build automation
   - Add linting and formatting tools

4. **Documentation**:
   - Add more examples
   - Create tutorials
   - Improve API documentation