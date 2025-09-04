# Web-Exporter Technical Sheet

This document outlines the technical considerations, simulations, and future roadmap for the Wallpaper Engine Web-Exporter project.

## MVP Simulations

The current Minimum Viable Product (MVP) of the Web-Exporter includes several simulated components to achieve initial functionality and demonstrate the core concept without full implementation of complex features.

*   **Shader Translation:** Currently, shader translation from Wallpaper Engine's proprietary format to web-compatible formats (e.g., GLSL for WebGL) is simulated. The MVP uses pre-rendered or simplified visual effects for demos. The actual translation will involve a robust parser and transpiler.
*   **Particle Porting:** The complex particle systems from Wallpaper Engine are simulated with static images or basic CSS/JavaScript animations in the MVP. Real-time, interactive particle system porting would require a dedicated physics engine and rendering pipeline.
*   **Full RePKG Unpack in Browser:** The complete unpacking of `.pkg` files using the RePKG utility is currently simulated or performed server-side for demo purposes. A full client-side RePKG implementation using WebAssembly (WASM) is a planned future phase. For the MVP, demo content is pre-unpacked or handled by a simplified backend.

## Simulated Outputs vs. Intended Real Outputs

*   **Placeholder `index.html`:** For initial demos, a static or minimally interactive `index.html` file is generated. This will eventually be replaced by a dynamic, high-performance Pixi.js or Three.js based parallax page that accurately reflects the original Wallpaper Engine scene.
*   **Simplified Visuals:** Many complex visual effects and interactions are simplified in the MVP. The intention is to replicate these with high fidelity using WebGL/WebGPU and advanced rendering techniques.

## Security, CORS, and Legal Considerations

*   **CORS:** For local development and potential future API integrations, careful consideration of Cross-Origin Resource Sharing (CORS) policies is necessary to prevent browser security restrictions.
*   **Legal:** The conversion and distribution of copyrighted Wallpaper Engine content must strictly adhere to legal guidelines. The project explicitly states that converted assets are for demo/educational purposes only, with full credit to original artists and a clear takedown policy. Users are encouraged to support original creators.
*   **Security:** Any future server-side components handling file uploads or processing must implement robust security measures to prevent malicious uploads, denial-of-service attacks, and data breaches. Client-side processing reduces some server-side risks but introduces new client-side vulnerabilities if not handled carefully.

## Server vs. Client Responsibilities

*   **Unpacking:** Currently, `.pkg` file unpacking is primarily a server-side (or pre-processed/simulated) responsibility. This avoids heavy client-side computation for the MVP.
*   **WASM RePKG (Phase 2):** The long-term goal is to move the RePKG unpacking process to the client-side using WebAssembly, enabling faster, more private, and scalable conversions without relying on server infrastructure for core unpacking.
*   **Asset Conversion & Optimization:** Initial asset conversion (e.g., texture formats, video transcoding) might leverage server-side processing for performance, with eventual migration to client-side where feasible.
*   **UI & Interaction:** The user interface and real-time interactive elements are primarily client-side responsibilities.

## Performance Constraints and Recommended Upload Size Limits

*   **Browser Limitations:** Browsers have inherent limitations on memory, CPU, and GPU usage. Large wallpapers with numerous assets, high-resolution textures, or complex logic can strain browser resources.
*   **Upload Size:** While not strictly enforced by the MVP, a recommended upload size limit of **~50-100MB** for `.pkg` files is suggested to ensure reasonable processing times and prevent browser crashes, especially during client-side WASM unpacking. Larger files may require significant time and resources.
*   **Real-time Rendering:** Achieving smooth 60fps rendering for complex wallpapers will require aggressive optimization, asset streaming, and efficient WebGL/WebGPU utilization.

## Step-by-step Roadmap for Replacing Simulations with Real Implementations

1.  **Phase 1: MVP (Current)**
    *   Basic UI for upload and demo selection.
    *   Simulated shader/particle effects for demos.
    *   Server-side (or pre-processed) unpacking for demos.
    *   Placeholder `index.html` generation.

2.  **Phase 2: Client-Side WASM RePKG**
    *   Integrate RePKG compiled to WebAssembly for client-side `.pkg` file unpacking.
    *   Implement progress indicators for unpacking.
    *   Focus on robust error handling for corrupted or unsupported `.pkg` files.

3.  **Phase 3: Core Rendering Engine Integration (Pixi.js/Three.js)**
    *   Develop a core rendering module using Pixi.js or Three.js to handle basic scene graph, texture loading, and animation.
    *   Implement rudimentary parallax and simple particle rendering based on extracted data.
    *   Start mapping Wallpaper Engine scene properties to renderer capabilities.

4.  **Phase 4: Shader & Particle System Porting**
    *   Research and develop a transpiler/parser for Wallpaper Engine's shader language to GLSL/WGSL.
    *   Implement a system to translate Wallpaper Engine's particle system definitions into a web-compatible particle engine (e.g., custom WebGL/WebGPU particles or a library).
    *   Gradual replacement of simulated effects with real-time rendered versions.

5.  **Phase 5: Advanced Features & Optimization**
    *   Support for more complex Wallpaper Engine features (e.g., audio reactivity, user inputs, advanced effects).
    *   Performance optimizations: asset compression, lazy loading, WebGPU integration.
    *   Refinement of the export process for better compatibility and smaller output sizes.

6.  **Phase 6: Deployment & Ecosystem**
    *   Robust deployment strategy (e.g., Vercel, Netlify).
    *   Potential API for programmatic conversions.
    *   Community contributions and documentation expansion.