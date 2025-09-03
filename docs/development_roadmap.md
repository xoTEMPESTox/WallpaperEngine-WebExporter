# Wallpaper Engine Web Exporter - Development Roadmap

This document outlines a high-level roadmap for the development of the Wallpaper Engine Web Exporter, prioritizing features for an iterative and manageable workflow.

## Phase 1: Core Conversion and Rendering Engine

**Goal:** Establish the foundational architecture and render basic, multi-layered image wallpapers with parallax.

*   **1.1: Implement New Project Structure:**
    *   [ ] Create the `converter`, `web_renderer`, and `templates` directories.
    *   [ ] Move existing conversion logic into the new `converter` structure.

*   **1.2: Develop the Intermediate Data Model (`project.json`):**
    *   [ ] `converter`: Implement `project_parser.py` to read `project.json` from a Wallpaper Engine project.
    *   [ ] `converter`: Implement `data_builder.py` to generate the intermediate `project.json` in the output directory.

*   **1.3: Build the Basic Web Renderer:**
    *   [ ] `web_renderer`: Set up a build process (e.g., with Webpack) to bundle JavaScript modules.
    *   [ ] `web_renderer`: Choose and integrate a rendering library (Recommendation: **Pixi.js** for Phase 1).
    *   [ ] `web_renderer`: Implement `asset_loader.js` to read the output `project.json` and load the required image assets.
    *   [ ] `web_renderer`: Implement `renderer.js` to render layers based on the `layers` array in the JSON file.

*   **1.4: Implement Parallax Effect:**
    *   [ ] `web_renderer`: Create an `effect_manager.js` that handles mouse movement.
    *   [ ] `web_renderer`: Apply parallax offsets to layers that have the `parallax` effect defined.

## Phase 2: Advanced Asset and Effect Support

**Goal:** Expand the exporter's capabilities to handle more complex wallpaper types, including video and basic particle effects.

*   **2.1: Add Video Layer Support:**
    *   [ ] `converter`: Update `data_builder.py` to handle video layers and assets.
    *   [ ] `web_renderer`: Enhance `renderer.js` and `asset_loader.js` to support rendering `<video>` elements as layers.

*   **2.2: Basic Particle System Implementation:**
    *   [ ] `converter`: Parse basic particle effect settings from the Wallpaper Engine project.
    *   [ ] `web_renderer`: Integrate a lightweight particle library (e.g., `pixi-particles`) or build a simple emitter.
    *   [ ] `web_renderer`: Render particle effects based on properties defined in `project.json`.

*   **2.3: User Property Integration:**
    *   [ ] `converter`: Parse `userProperties` from the Wallpaper Engine project.
    *   [ ] `web_renderer`: Create a simple UI to allow users to change basic properties (e.g., color, speed) and see the effects in real-time.

## Phase 3: Shader and Interactive Effects

**Goal:** Replicate more advanced visual effects and user interactions.

*   **3.1: GLSL Shader Support:**
    *   [ ] `converter`: Extract GLSL shader code from Wallpaper Engine projects.
    *   [ ] `web_renderer`: Switch to or integrate **Three.js** for robust shader support.
    *   [ ] `web_renderer`: Implement a system to apply custom shaders to layers as effects.

*   **3.2: Advanced Interactive Effects:**
    *   [ ] `converter`: Parse more complex effect data (e.g., water ripples, shake effects).
    *   [ ] `web_renderer`: Develop individual modules within `effect_manager.js` for each major interactive effect, triggered by user input or audio.

*   **3.3: Audio-Reactive Visuals:**
    *   [ ] `web_renderer`: Use the Web Audio API to analyze audio input.
    *   [ ] `web_renderer`: Link audio frequency and amplitude data to effect parameters (e.g., particle emission rate, pulse effect intensity).

## Phase 4: Optimization and Community Features

**Goal:** Refine performance, improve the user experience, and add features for sharing.

*   **4.1: Performance Optimization:**
    *   [ ] `converter`: Implement asset optimization (image compression, video transcoding).
    *   [ ] `web_renderer`: Implement lazy loading for assets and code splitting.
    *   [ ] `web_renderer`: Profile and optimize rendering performance.

*   **4.2: One-Click Deploy/Share:**
    *   [ ] Implement a feature to easily upload the `output` folder to a service like GitHub Pages or Netlify.

*   **4.3: Extensible Plugin System:**
    *   [ ] Refactor the `effect_manager.js` to allow for custom, user-created effects to be easily added.