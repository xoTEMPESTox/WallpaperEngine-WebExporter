// Debug flag - can be enabled/disabled for debugging
const DEBUG = false;

// Simple debug logging function
function debugLog(message) {
    if (DEBUG) {
        console.log(`[Particles] ${message}`);
    }
}

class Particle {
    constructor(x, y, settings) {
        debugLog(`Creating particle at (${x}, ${y})`);
        this.x = x;
        this.y = y;
        this.settings = settings;
        
        // Randomize initial velocity based on settings and spread
        const angle = (Math.random() - 0.5) * settings.spread * Math.PI / 180;
        const speed = Math.sqrt(settings.velocity.x * settings.velocity.x + settings.velocity.y * settings.velocity.y);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.age = 0;
        this.maxAge = settings.lifetime;
        this.size = settings.size || 2;
        this.color = settings.color || '#FFFFFF';
        this.alpha = 1;
        
        debugLog(`Particle created with velocity (${this.vx}, ${this.vy}), lifetime ${this.maxAge}`);
    }
    
    update(deltaTime) {
        debugLog(`Updating particle at (${this.x}, ${this.y}) with velocity (${this.vx}, ${this.vy})`);
        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update age
        this.age += deltaTime;
        
        // Update alpha based on age (fade out)
        this.alpha = 1 - (this.age / this.maxAge);
        
        debugLog(`Particle age: ${this.age}/${this.maxAge}, alpha: ${this.alpha}`);
        
        // Return true if particle is still alive
        const isAlive = this.age < this.maxAge;
        if (!isAlive) {
            debugLog("Particle died");
        }
        return isAlive;
    }
    
    render(ctx) {
        debugLog(`Rendering particle at (${this.x}, ${this.y}) with alpha ${this.alpha}`);
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor(layerData) {
        debugLog(`Creating ParticleSystem for layer: ${layerData.name}`);
        this.layerData = layerData;
        this.settings = layerData.particleSettings;
        this.particles = [];
        this.emissionTimer = 0;
        this.position = {
            x: layerData.transform.position[0] || 0,
            y: layerData.transform.position[1] || 0
        };
        debugLog(`ParticleSystem position: (${this.position.x}, ${this.position.y})`);
        debugLog(`ParticleSystem settings: ${JSON.stringify(this.settings)}`);
    }
    
    update(deltaTime) {
        debugLog(`Updating ParticleSystem with ${this.particles.length} particles`);
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const isAlive = this.particles[i].update(deltaTime);
            if (!isAlive) {
                debugLog(`Removing dead particle, ${this.particles.length - 1} particles remaining`);
                this.particles.splice(i, 1);
            }
        }
        
        // Emit new particles
        this.emissionTimer += deltaTime;
        const emissionInterval = 1 / this.settings.emissionRate;
        debugLog(`Emission timer: ${this.emissionTimer}, interval: ${emissionInterval}`);
        
        let particlesEmitted = 0;
        while (this.emissionTimer >= emissionInterval) {
            this.emitParticle();
            this.emissionTimer -= emissionInterval;
            particlesEmitted++;
        }
        
        if (particlesEmitted > 0) {
            debugLog(`Emitted ${particlesEmitted} particles, total: ${this.particles.length}`);
        }
    }
    
    emitParticle() {
        debugLog(`Emitting particle at (${this.position.x}, ${this.position.y})`);
        const particle = new Particle(this.position.x, this.position.y, this.settings);
        this.particles.push(particle);
        debugLog(`Particle emitted, total particles: ${this.particles.length}`);
    }
    
    render(ctx) {
        debugLog(`Rendering ${this.particles.length} particles`);
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }
}

// Export ParticleSystem for global access
window.ParticleSystem = ParticleSystem;