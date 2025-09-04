# Wallpaper Engine Web-Exporter Technical Sheet

This document outlines the technical considerations, simulations, and future roadmap for the Wallpaper Engine Web-Exporter project.

## Realized Capabilities (Phase 2)

The Wallpaper Engine Web-Exporter has advanced beyond initial simulations. The following core functionalities are now fully implemented and provide real conversion for their respective wallpaper types:

*   **Video Wallpaper Conversion:** The exporter now fully processes and generates web-compatible video wallpapers. This includes direct fetching of video assets and embedding them in optimized HTML structures.
*   **Parallax Wallpaper Conversion:** Real parallax effects are now generated using Pixi.js, accurately reflecting the original Wallpaper Engine configurations. This involves extracting and arranging image layers and applying appropriate transformations for depth perception.
*   **Workshop Item Fetching:** The system can now genuinely fetch and process `.pkg` files from the Steam Workshop, enabling real conversion pipelines.

## Current Simulations and Future Work

While significant progress has been made, certain complex features are still simulated or are part of the future roadmap:

*   **Full RePKG Unpacking (CLI vs. Server-side):** While fetching is real, full `.pkg` unpacking, especially for complex or large wallpapers, is primarily handled by the CLI tool. Server-side unpacking within the web application (e.g., for direct browser-based conversions without the CLI) is still simulated or limited due to Vercel function constraints (size/time). A full client-side RePKG implementation using WebAssembly (WASM) remains a planned future phase for improved scalability and privacy.
*   **Advanced Particle Systems:** The complex particle systems from Wallpaper Engine are still simulated with static images or basic CSS/JavaScript animations in the web export. Real-time, interactive particle system porting requires a dedicated physics engine and rendering pipeline.
*   **Shader Translation:** Shader translation from Wallpaper Engine's proprietary format to web-compatible formats (e.g., GLSL for WebGL) is currently simulated. The exporter uses pre-rendered or simplified visual effects for demos. The actual translation will involve a robust parser and transpiler.
*   **Complex Scene Features:** Many advanced visual effects, user interactions, and dynamic elements present in Wallpaper Engine are simplified or not yet supported in the web exports. The intention is to replicate these with high fidelity using WebGL/WebGPU and advanced rendering techniques in future phases.

## Path Handling, Asset Size, and Performance Optimizations

*   **Relative Paths:** All generated asset references (images, videos, scripts) in `index.html` and `script.js` utilize relative paths (e.g., `./assets/image.png` or `sample_video.mp4`). This ensures portability of the generated web exports.

*   **Optional Image Downscaling (Planned):**
   *   **Feature:** Future iterations will include logic for optional image downscaling to cap image dimensions (e.g., at 2048 pixels width) for improved web performance.
   *   **Current Status:** Due to the "no external pip deps" constraint for `converter/` Python scripts, actual image processing libraries (like Pillow) cannot be directly integrated in the current MVP phase. A placeholder comment has been added to `converter/generator.py` indicating where this logic would reside.
   *   **Implications:** Until implemented, large source images will be included at their original resolution, potentially impacting load times and memory usage for parallax exports.
   *   **Future Task:** Integrate an image processing solution (e.g., via a separate microservice, a client-side WASM module, or by relaxing the `pip deps` constraint for a dedicated image processing utility) to enable this feature.

*   **Lazy-Loading/Preloading Hints:**
   *   **Video Exports:** The `video` tag in generated `index.html` files now includes `preload="auto"` to hint browsers to optimize video loading.
   *   **Parallax Exports (Images):** Images in parallax exports are loaded via Pixi.js's internal loader (`PIXI.Sprite.from()`). Pixi.js handles asset loading and caching internally. While explicit `loading="lazy"` attributes are not directly applied to `<img>` tags (as images are loaded programmatically), Pixi.js's loading mechanism implicitly manages resource fetching. For more advanced lazy-loading or preloading strategies for large Pixi.js projects, developers would typically leverage Pixi.Loader or implement custom loading screens.

## Security, CORS, and Legal Considerations

*   **CORS & Steam Interactions:** Careful consideration of Cross-Origin Resource Sharing (CORS) policies is necessary, especially when interacting with external services like Steam for fetching workshop content. Browser security restrictions must be managed.
*   **Legal:** The conversion and distribution of copyrighted Wallpaper Engine content must strictly adhere to legal guidelines. The project explicitly states that converted assets are for demo/educational purposes only, with full credit to original artists and a clear takedown policy. Users are encouraged to support original creators.
*   **Security:** Any future server-side components handling file uploads or processing must implement robust security measures to prevent malicious uploads, denial-of-service attacks, and data breaches. Client-side processing reduces some server-side risks but introduces new client-side vulnerabilities if not handled carefully.

## Server vs. Client Responsibilities

*   **Unpacking:** Currently, `.pkg` file unpacking is primarily a server-side (or pre-processed/simulated) responsibility. This avoids heavy client-side computation for the MVP.
*   **WASM RePKG (Phase 2):** The long-term goal is to move the RePKG unpacking process to the client-side using WebAssembly, enabling faster, more private, and scalable conversions without relying on server infrastructure for core unpacking.
*   **Asset Conversion & Optimization:** Initial asset conversion (e.g., texture formats, video transcoding) might leverage server-side processing for performance, with eventual migration to client-side where feasible.
*   **UI & Interaction:** The user interface and real-time interactive elements are primarily client-side responsibilities.

 *   **Serverless Function (generate-zip) & Vercel Limits:** Currently, the `/api/generate-zip` function directly generates the `.zip` file server-side. This approach is suitable for smaller wallpapers. However, for larger wallpapers that might exceed Vercel's serverless function execution limits (10-20 seconds) or response size limits (10MB), this direct generation method may become problematic.

    **Recommendation for Heavy Conversions:** For very large or complex wallpapers, it is highly recommended to utilize the **CLI (Command Line Interface) tool** for conversion. The CLI provides a more robust and scalable solution, bypassing the inherent limitations of serverless functions.

    **Future Consideration for Serverless:** If performance or size limits are consistently hit for web-based conversions, the `generate-zip` function will be refactored to act as an orchestrator. This orchestration could involve:
    *   Returning a **signed download URL** to a pre-built zip file stored in a cloud storage service (e.g., AWS S3, Vercel Blob).
    *   Instructing the client to attempt client-side zip generation for small cases, leveraging browser capabilities.
    This would offload heavy processing from the serverless function and provide a more scalable solution.
## Performance Constraints and Recommended Upload Size Limits

*   **Browser Limitations:** Browsers have inherent limitations on memory, CPU, and GPU usage. Large wallpapers with numerous assets, high-resolution textures, or complex logic can strain browser resources.
*   **Upload Size:** While not strictly enforced by the MVP, a recommended upload size limit of **~50-100MB** for `.pkg` files is suggested to ensure reasonable processing times and prevent browser crashes, especially during client-side WASM unpacking. Larger files may require significant time and resources.
*   **Real-time Rendering:** Achieving smooth 60fps rendering for complex wallpapers will require aggressive optimization, asset streaming, and efficient WebGL/WebGPU utilization.

## Step-by-step Roadmap for Replacing Simulations with Real Implementations

1.  **Phase 1: Initial Implementation (Completed)**
    *   Basic UI for upload and demo selection.
    *   Real conversion for video and parallax wallpapers.
    *   Server-side fetching and processing of `.pkg` files.

2.  **Phase 2: Current Phase (Ongoing)**
    *   Refinement of video and parallax conversion processes.
    *   Addressing performance constraints and optimizing output.
    *   Exploring more robust fetching mechanisms.

3.  **Phase 3: Advanced Rendering & Interactivity (Next)**
    *   Develop a comprehensive rendering module using Pixi.js/Three.js to handle complex scene graphs, advanced texture loading, and sophisticated animations.
    *   Implement a system for **real-time particle and shader porting** from Wallpaper Engine, moving beyond current simulations. This will involve:
        *   Research and development of a transpiler/parser for Wallpaper Engine's shader language to GLSL/WGSL.
        *   Integration of a web-compatible particle engine to accurately render Wallpaper Engine's particle systems.
    *   Full mapping of Wallpaper Engine scene properties to web renderer capabilities.

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