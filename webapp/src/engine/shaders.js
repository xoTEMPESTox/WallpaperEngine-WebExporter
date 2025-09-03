// Debug flag - can be enabled/disabled for debugging
const DEBUG = false;

// Simple debug logging function
function debugLog(message) {
    if (DEBUG) {
        console.log(`[Shaders] ${message}`);
    }
}

class ShaderProgram {
    constructor(vertexShaderSource, fragmentShaderSource) {
        debugLog("Creating ShaderProgram");
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
        this.program = null;
        this.uniformLocations = {};
    }

    /**
     * Compile a shader from source code
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} source - Shader source code
     * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     * @returns {WebGLShader} Compiled shader
     */
    compileShader(gl, source, type) {
        const shaderType = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
        debugLog(`Compiling ${shaderType} shader`);
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            debugLog(`Shader compilation failed: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }

        debugLog(`${shaderType} shader compiled successfully`);
        return shader;
    }

    /**
     * Create and link the shader program
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    createProgram(gl) {
        debugLog("Creating shader program");
        // Compile vertex shader
        const vertexShader = this.compileShader(gl, this.vertexShaderSource, gl.VERTEX_SHADER);
        if (!vertexShader) {
            console.error('Failed to compile vertex shader');
            debugLog('Failed to compile vertex shader');
            return;
        }

        // Compile fragment shader
        const fragmentShader = this.compileShader(gl, this.fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!fragmentShader) {
            console.error('Failed to compile fragment shader');
            debugLog('Failed to compile fragment shader');
            gl.deleteShader(vertexShader);
            return;
        }

        // Create program and attach shaders
        debugLog("Creating and linking program");
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        // Clean up shaders
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Shader program linking error:', gl.getProgramInfoLog(this.program));
            debugLog(`Shader program linking failed: ${gl.getProgramInfoLog(this.program)}`);
            gl.deleteProgram(this.program);
            this.program = null;
            return;
        }

        debugLog("Shader program created and linked successfully");
        // Get uniform locations
        this.uniformLocations = {};
    }

    /**
     * Use this shader program for rendering
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    use(gl) {
        if (this.program) {
            debugLog("Using shader program");
            gl.useProgram(this.program);
        } else {
            debugLog("No shader program to use");
        }
    }

    /**
     * Set a float uniform value
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - Uniform name
     * @param {number} value - Float value
     */
    setUniform1f(gl, name, value) {
        if (this.program) {
            debugLog(`Setting uniform ${name} to ${value}`);
            const location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (location) {
                this.uniformLocations[name] = location;
                gl.uniform1f(location, value);
            } else {
                debugLog(`Uniform location for ${name} not found`);
            }
        }
    }

    /**
     * Set a vec2 uniform value
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - Uniform name
     * @param {Array<number>} value - Vec2 value [x, y]
     */
    setUniform2f(gl, name, value) {
        if (this.program) {
            debugLog(`Setting uniform ${name} to [${value[0]}, ${value[1]}]`);
            const location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (location) {
                this.uniformLocations[name] = location;
                gl.uniform2f(location, value[0], value[1]);
            } else {
                debugLog(`Uniform location for ${name} not found`);
            }
        }
    }

    /**
     * Set a vec3 uniform value
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - Uniform name
     * @param {Array<number>} value - Vec3 value [x, y, z]
     */
    setUniform3f(gl, name, value) {
        if (this.program) {
            debugLog(`Setting uniform ${name} to [${value[0]}, ${value[1]}, ${value[2]}]`);
            const location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (location) {
                this.uniformLocations[name] = location;
                gl.uniform3f(location, value[0], value[1], value[2]);
            } else {
                debugLog(`Uniform location for ${name} not found`);
            }
        }
    }
}

// Export ShaderProgram for global access
window.ShaderProgram = ShaderProgram;