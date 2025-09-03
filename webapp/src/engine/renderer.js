// Debug flag - can be enabled/disabled for debugging
const DEBUG = false;

// Simple debug logging function
function debugLog(message) {
    if (DEBUG) {
        console.log(`[Renderer] ${message}`);
    }
}

class Layer {
    constructor(layerData, assets) {
        debugLog(`Creating layer: ${layerData.name} (${layerData.type})`);
        this.layerData = layerData;
        this.assets = assets;
        
        // Handle different layer types
        if (this.layerData.type === 'particles') {
            debugLog("Initializing particle layer");
            // We'll initialize the particle system in the Scene class
            this.element = null; // Particles don't use DOM elements
            this.particleSystem = null; // Will be set by Scene
            this.shaderProgram = null;
        } else if (this.layerData.type === 'shader') {
            debugLog("Initializing shader layer");
            this.element = null; // Shaders don't use DOM elements
            this.particleSystem = null;
            this.shaderProgram = null; // Will be set by Scene
        } else {
            debugLog("Initializing image layer");
            this.element = this.createElement();
            this.particleSystem = null;
            this.shaderProgram = null;
        }
    }

    createElement() {
        debugLog(`Creating element for layer: ${this.layerData.name}`);
        if (this.layerData.type === 'image') {
            debugLog(`Creating image element with src: ${this.assets.images[this.layerData.asset_key]}`);
            const img = document.createElement('img');
            img.src = this.assets.images[this.layerData.asset_key];
            img.style.position = 'absolute';
            img.style.left = `${this.layerData.transform.position[0]}px`;
            img.style.top = `${this.layerData.transform.position[1]}px`;
            img.style.transform = `scale(${this.layerData.transform.scale[0]}, ${this.layerData.transform.scale[1]})`;
            return img;
        }
        debugLog("No element created for this layer type");
        return null;
    }

    update(deltaTime, offsetX, offsetY) {
        debugLog(`Updating layer: ${this.layerData.name}`);
        // Update particle system if this is a particle layer
        if (this.particleSystem) {
            debugLog(`Updating particle system for layer: ${this.layerData.name}`);
            this.particleSystem.update(deltaTime);
        }
        
        // Update position for DOM elements with parallax
        if (this.element) {
            debugLog(`Updating element position for layer: ${this.layerData.name}`);
            const parallax = this.getParallax();
            if (parallax) {
                debugLog(`Applying parallax effect to layer: ${this.layerData.name}`);
                const newX = this.layerData.transform.position[0] + offsetX * parallax.depth * parallax.intensity;
                const newY = this.layerData.transform.position[1] + offsetY * parallax.depth * parallax.intensity;
                this.element.style.left = `${newX}px`;
                this.element.style.top = `${newY}px`;
            }
        }
    }

    render(ctx) {
        debugLog(`Rendering layer: ${this.layerData.name}`);
        // Render particles if this is a particle layer
        if (this.particleSystem) {
            debugLog(`Rendering particle system for layer: ${this.layerData.name}`);
            this.particleSystem.render(ctx);
        }
    }

    getParallax() {
        if (this.layerData.effects) {
            return this.layerData.effects.find(effect => effect.name === 'parallax');
        }
        return null;
    }
}

class Scene {
    constructor(projectData, container) {
        debugLog("Creating Scene");
        this.projectData = projectData;
        this.container = container;
        this.layers = [];
        this.canvas = null;
        this.ctx = null;
        this.webglCanvas = null;
        this.gl = null;
        this.lastTime = 0;
        this.init();
    }

    init() {
        debugLog("Initializing Scene");
        // Create canvas for particle rendering
        debugLog("Creating canvas for particle rendering");
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Create WebGL canvas for shader rendering
        debugLog("Creating WebGL canvas for shader rendering");
        this.webglCanvas = document.createElement('canvas');
        this.webglCanvas.style.position = 'absolute';
        this.webglCanvas.style.left = '0';
        this.webglCanvas.style.top = '0';
        this.webglCanvas.width = this.container.offsetWidth;
        this.webglCanvas.height = this.container.offsetHeight;
        this.gl = this.webglCanvas.getContext('webgl') || this.webglCanvas.getContext('experimental-webgl');
        this.container.appendChild(this.webglCanvas);
        
        // Set up container styles
        debugLog("Setting up container styles");
        this.container.style.position = 'relative';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.overflow = 'hidden';

        // Create layers
        debugLog(`Creating ${this.projectData.layers.length} layers`);
        this.projectData.layers.forEach(layerData => {
            const layer = new Layer(layerData, this.projectData.assets);
            
            // If this is a particle layer, create the particle system
            if (layerData.type === 'particles') {
                debugLog(`Creating particle system for layer: ${layerData.name}`);
                // Dynamically create ParticleSystem
                layer.particleSystem = new window.ParticleSystem(layerData);
                this.layers.push(layer);
            } else if (layerData.type === 'shader') {
                debugLog(`Creating shader layer: ${layerData.name}`);
                // For shader layers, we'll initialize the shader program in the Scene class
                this.layers.push(layer);
            } else if (layer.element) {
                debugLog(`Creating element layer: ${layerData.name}`);
                // For non-particle layers with elements
                this.layers.push(layer);
                this.container.appendChild(layer.element);
            } else {
                debugLog(`Skipping layer: ${layerData.name} (no element created)`);
            }
        });

        // Add mouse move listener for parallax effect
        debugLog("Adding mouse move listener");
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Start animation loop
        debugLog("Starting animation loop");
        this.animate();
    }

    handleMouseMove(event) {
        debugLog("Handling mouse move event");
        const centerX = this.container.offsetWidth / 2;
        const centerY = this.container.offsetHeight / 2;
        const mouseX = event.clientX - this.container.getBoundingClientRect().left;
        const mouseY = event.clientY - this.container.getBoundingClientRect().top;

        const offsetX = (mouseX - centerX) / centerX;
        const offsetY = (mouseY - centerY) / centerY;

        debugLog(`Mouse offset: (${offsetX}, ${offsetY})`);
        this.layers.forEach(layer => {
            // For particle layers, we'll handle updates in the animation loop
            if (layer.element) {
                debugLog(`Updating layer ${layer.layerData.name} with mouse offset`);
                layer.update(0, offsetX, offsetY);
            }
        });
    }

    animate(timestamp = 0) {
        // Calculate delta time in seconds
        const deltaTime = timestamp ? (timestamp - this.lastTime) / 1000 : 0;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render all layers
        debugLog(`Animating ${this.layers.length} layers`);
        this.layers.forEach(layer => {
            // For particle layers, update with deltaTime
            if (layer.particleSystem) {
                debugLog(`Updating and rendering particle layer: ${layer.layerData.name}`);
                layer.update(deltaTime, 0, 0);
                layer.render(this.ctx);
            }
            // For shader layers, render with WebGL
            else if (layer.layerData.type === 'shader' && this.gl) {
                debugLog(`Rendering shader layer: ${layer.layerData.name}`);
                this.renderShaderLayer(layer);
            } else {
                debugLog(`Skipping layer: ${layer.layerData.name} (no renderer)`);
            }
        });
        
        // Continue animation loop
        requestAnimationFrame(this.animate.bind(this));
    }

    renderShaderLayer(layer) {
        debugLog(`Rendering shader layer: ${layer.layerData.name}`);
        if (!layer.shaderProgram) {
            debugLog("Creating shader program");
            // Create shader program if it doesn't exist
            const shaderData = layer.layerData.shader;
            
            // For now, we'll use simple default shaders
            // In a real implementation, we would load from files
            const vertexShaderSource = `
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;
            
            const fragmentShaderSource = `
                precision mediump float;
                uniform float u_time;
                uniform vec2 u_resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution;
                    vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
                    gl_FragColor = vec4(color, 1.0);
                }
            `;
            
            layer.shaderProgram = new window.ShaderProgram(vertexShaderSource, fragmentShaderSource);
            layer.shaderProgram.createProgram(this.gl);
        }
        
        if (layer.shaderProgram.program) {
            debugLog("Using shader program");
            // Use shader program
            layer.shaderProgram.use(this.gl);
            
            // Set uniforms
            debugLog("Setting uniforms");
            layer.shaderProgram.setUniform1f(this.gl, 'u_time', this.lastTime / 1000);
            layer.shaderProgram.setUniform2f(this.gl, 'u_resolution', [this.webglCanvas.width, this.webglCanvas.height]);
            
            // Create and bind a simple quad
            debugLog("Creating and binding quad");
            const positions = new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                 1.0,  1.0
            ]);
            
            const positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
            
            const positionLocation = this.gl.getAttribLocation(layer.shaderProgram.program, 'a_position');
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            
            // Draw the quad
            debugLog("Drawing quad");
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        } else {
            debugLog("Shader program not available");
        }
    }
}