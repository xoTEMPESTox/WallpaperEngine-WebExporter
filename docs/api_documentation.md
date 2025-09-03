# Wallpaper Engine Web Exporter - API Documentation

## Overview

This document provides detailed documentation for the core engine classes and the data model used by the Wallpaper Engine Web Exporter. It covers the JavaScript classes that power the web rendering engine and the structure of the intermediate data model.

## Scene Class

The `Scene` class is the main controller for rendering a Wallpaper Engine project in the browser.

### Constructor

```javascript
new Scene(projectData, container)
```

**Parameters**:
- `projectData` (Object): The parsed project.json data model
- `container` (HTMLElement): The DOM element to render the scene into

**Description**:
Creates a new Scene instance that manages all layers and rendering for a Wallpaper Engine project.

### Methods

#### init()

```javascript
scene.init()
```

**Description**: 
Initializes the scene by creating canvases for rendering, setting up the container, creating layers from the project data, and starting the animation loop.

#### handleMouseMove(event)

```javascript
scene.handleMouseMove(event)
```

**Parameters**:
- `event` (MouseEvent): The mouse move event

**Description**: 
Handles mouse movement for parallax effects. Calculates the offset from the center of the container and updates layer positions accordingly.

#### animate(timestamp)

```javascript
scene.animate(timestamp)
```

**Parameters**:
- `timestamp` (number): The current time from requestAnimationFrame

**Description**: 
Main animation loop that updates and renders all layers. Called recursively using requestAnimationFrame.

#### renderShaderLayer(layer)

```javascript
scene.renderShaderLayer(layer)
```

**Parameters**:
- `layer` (Layer): The shader layer to render

**Description**: 
Renders a shader layer using WebGL. Creates and compiles shader programs if they don't exist, sets uniforms, and draws a full-screen quad.

## Layer Class

The `Layer` class represents a single layer in a Wallpaper Engine project, which can be an image, particle system, or shader.

### Constructor

```javascript
new Layer(layerData, assets)
```

**Parameters**:
- `layerData` (Object): The layer data from project.json
- `assets` (Object): The assets data from project.json

**Description**:
Creates a new Layer instance that represents a single layer in the project.

### Methods

#### createElement()

```javascript
layer.createElement()
```

**Returns**: HTMLElement or null

**Description**: 
Creates a DOM element for image layers. Returns null for particle or shader layers.

#### update(deltaTime, offsetX, offsetY)

```javascript
layer.update(deltaTime, offsetX, offsetY)
```

**Parameters**:
- `deltaTime` (number): Time since last update in seconds
- `offsetX` (number): X offset for parallax effect
- `offsetY` (number): Y offset for parallax effect

**Description**: 
Updates the layer state. For particle layers, updates the particle system. For DOM elements, applies parallax offsets.

#### render(ctx)

```javascript
layer.render(ctx)
```

**Parameters**:
- `ctx` (CanvasRenderingContext2D): The 2D canvas context to render to

**Description**: 
Renders the layer. For particle layers, renders the particles to the canvas context.

#### getParallax()

```javascript
layer.getParallax()
```

**Returns**: Object or null

**Description**: 
Returns the parallax effect data for this layer, or null if no parallax effect is applied.

## ParticleSystem Class

The `ParticleSystem` class manages and renders particle effects for a layer.

### Constructor

```javascript
new ParticleSystem(layerData)
```

**Parameters**:
- `layerData` (Object): The layer data from project.json containing particle settings

**Description**:
Creates a new ParticleSystem instance that manages particles for a layer.

### Methods

#### update(deltaTime)

```javascript
particleSystem.update(deltaTime)
```

**Parameters**:
- `deltaTime` (number): Time since last update in seconds

**Description**: 
Updates all particles in the system. Removes dead particles and emits new ones based on the emission rate.

#### emitParticle()

```javascript
particleSystem.emitParticle()
```

**Description**: 
Emits a new particle at the system's position with settings from the particle configuration.

#### render(ctx)

```javascript
particleSystem.render(ctx)
```

**Parameters**:
- `ctx` (CanvasRenderingContext2D): The 2D canvas context to render to

**Description**: 
Renders all particles in the system to the canvas context.

## Particle Class

The `Particle` class represents a single particle in a particle system.

### Constructor

```javascript
new Particle(x, y, settings)
```

**Parameters**:
- `x` (number): Initial X position
- `y` (number): Initial Y position
- `settings` (Object): Particle settings from the particle system

**Description**:
Creates a new Particle instance with the specified position and settings.

### Methods

#### update(deltaTime)

```javascript
particle.update(deltaTime)
```

**Parameters**:
- `deltaTime` (number): Time since last update in seconds

**Returns**: boolean

**Description**: 
Updates the particle's position, age, and alpha. Returns true if the particle is still alive, false if it should be removed.

#### render(ctx)

```javascript
particle.render(ctx)
```

**Parameters**:
- `ctx` (CanvasRenderingContext2D): The 2D canvas context to render to

**Description**: 
Renders the particle to the canvas context as a colored circle with alpha blending.

## ShaderProgram Class

The `ShaderProgram` class manages WebGL shader programs for rendering shader effects.

### Constructor

```javascript
new ShaderProgram(vertexShaderSource, fragmentShaderSource)
```

**Parameters**:
- `vertexShaderSource` (string): Source code for the vertex shader
- `fragmentShaderSource` (string): Source code for the fragment shader

**Description**:
Creates a new ShaderProgram instance that can compile and manage a WebGL shader program.

### Methods

#### compileShader(gl, source, type)

```javascript
shaderProgram.compileShader(gl, source, type)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context
- `source` (string): Shader source code
- `type` (number): Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)

**Returns**: WebGLShader or null

**Description**: 
Compiles a shader from source code. Returns the compiled shader or null if compilation fails.

#### createProgram(gl)

```javascript
shaderProgram.createProgram(gl)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context

**Description**: 
Creates and links the shader program by compiling the vertex and fragment shaders and linking them together.

#### use(gl)

```javascript
shaderProgram.use(gl)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context

**Description**: 
Activates this shader program for rendering.

#### setUniform1f(gl, name, value)

```javascript
shaderProgram.setUniform1f(gl, name, value)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context
- `name` (string): Uniform variable name
- `value` (number): Float value to set

**Description**: 
Sets a float uniform value in the shader program.

#### setUniform2f(gl, name, value)

```javascript
shaderProgram.setUniform2f(gl, name, value)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context
- `name` (string): Uniform variable name
- `value` (Array<number>): Vec2 value [x, y] to set

**Description**: 
Sets a vec2 uniform value in the shader program.

#### setUniform3f(gl, name, value)

```javascript
shaderProgram.setUniform3f(gl, name, value)
```

**Parameters**:
- `gl` (WebGLRenderingContext): The WebGL context
- `name` (string): Uniform variable name
- `value` (Array<number>): Vec3 value [x, y, z] to set

**Description**: 
Sets a vec3 uniform value in the shader program.

## Data Model for project.json

The `project.json` file serves as the intermediate data model between the Python converter and the JavaScript renderer. It contains all the information needed to render the wallpaper in a web browser.

### Structure

```json
{
  "projectInfo": {
    "name": "string",
    "id": "string",
    "file": "string",
    "preview": "string"
  },
  "assets": {
    "images": {
      "asset_key": "string"
    },
    "videos": {
      "asset_key": "string"
    },
    "models": {
      "asset_key": "string"
    }
  },
  "layers": [
    {
      // Layer objects (see below)
    }
  ],
  "userProperties": {}
}
```

### Image Layer

```json
{
  "name": "string",
  "type": "image",
  "asset_key": "string",
  "transform": {
    "position": [0, 0, 0],
    "scale": [1, 1, 1],
    "rotation": 0
  },
  "effects": [
    {
      "name": "parallax",
      "intensity": 1.0,
      "depth": 10
    }
  ]
}
```

### Particle Layer

```json
{
  "name": "string",
  "type": "particles",
  "particleSettings": {
    "emissionRate": 10,
    "lifetime": 5,
    "velocity": {
      "x": 0,
      "y": 0
    },
    "color": "#FFFFFF",
    "size": 2,
    "spread": 0
  },
  "transform": {
    "position": [0, 0, 0],
    "scale": [1, 1, 1],
    "rotation": 0
  },
  "effects": [
    {
      "name": "parallax",
      "intensity": 1.0,
      "depth": 10
    }
  ]
}
```

### Shader Layer

```json
{
  "name": "string",
  "type": "shader",
  "shader": {
    "vertexShaders": ["assets/shader.vert"],
    "fragmentShaders": ["assets/shader.frag"],
    "uniforms": {}
  },
  "transform": {
    "position": [0, 0, 0],
    "scale": [1, 1, 1],
    "rotation": 0
  },
  "effects": [
    {
      "name": "parallax",
      "intensity": 1.0,
      "depth": 10
    }
  ]
}
```

### Transform Properties

All layers have a `transform` property that defines their position, scale, and rotation:

- `position`: [x, y, z] coordinates
- `scale`: [x, y, z] scale factors
- `rotation`: Rotation around the Z axis in degrees

### Effects

Layers can have effects applied to them. Currently supported effects include:

- `parallax`: Creates a depth effect based on mouse movement
 - `intensity`: Strength of the parallax effect
  - `depth`: Depth value used in parallax calculations

## Converter Functions (Python)

The Python converter also has an API that can be used programmatically.

### convert_wallpaper_engine_project()

```python
convert_wallpaper_engine_project(project_path, output_path)
```

**Parameters**:
- `project_path` (Path): Path to the unpacked Wallpaper Engine project directory
- `output_path` (Path): Path to the directory where the web-compatible project will be saved

**Description**: 
Converts a single Wallpaper Engine project to the new web format.

### parse_particle_settings()

```python
parse_particle_settings(particle_data)
```

**Parameters**:
- `particle_data` (dict): Particle system data from Wallpaper Engine

**Returns**: dict

**Description**: 
Parses particle system settings from Wallpaper Engine particle data into a format suitable for the web renderer.

### parse_position() and parse_scale()

```python
parse_position(pos_str)
parse_scale(scale_str)
```

**Parameters**:
- `pos_str`/`scale_str` (str or dict): Position or scale data from Wallpaper Engine

**Returns**: list

**Description**: 
Parse position and scale strings into lists of floats for use in the web renderer.