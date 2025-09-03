// Parallax Wallpaper Script for {wallpaper_id}
async function initializeWallpaper() {
    const container = document.getElementById('wallpaper-container');
    if (!container) {
        // If the container is not ready, wait and try again
        requestAnimationFrame(initializeWallpaper);
        return;
    }

    // Initialize PixiJS application
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resizeTo: window,
        antialias: true
    });

    // Add the PixiJS canvas to our container
    container.appendChild(app.canvas);
    
    // Error display
    const errorContainer = document.getElementById('error-container');
    function displayError(message) {
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
        console.error(message);
    }
    
    // Layer definitions with parallax depth
    const layers = [
        {layers_str}
    ];
    
    // Load and create sprites for each layer
    const sprites = [];
    
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        
        try {
            // Create texture and sprite
            const texture = await PIXI.Assets.load(layer.url);
            const sprite = PIXI.Sprite.from(texture);
            
            // Position sprite in the center
            sprite.anchor.set(0.5);
            sprite.x = app.screen.width / 2;
            sprite.y = app.screen.height / 2;
            
            // Scale sprite to cover the screen with some extra space for parallax
            const scale = Math.max(
                app.screen.width / sprite.width,
                app.screen.height / sprite.height
            ) * 1.2;
            sprite.scale.set(scale);
            
            // Store reference to sprite and depth
            sprite.parallaxDepth = layer.depth;
            sprites.push(sprite);
            
            // Add sprite to stage (back to front)
            app.stage.addChild(sprite);
        } catch (error) {
            displayError(`Failed to load layer ${i} (${layer.url})`);
        }
    }
    
    // Handle mousemove for parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        sprites.forEach(sprite => {
            sprite.x = app.screen.width / 2 + mouseX * sprite.parallaxDepth * 50;
            sprite.y = app.screen.height / 2 + mouseY * sprite.parallaxDepth * 50;
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        
        // Reposition all sprites
        sprites.forEach(sprite => {
            sprite.x = app.screen.width / 2;
            sprite.y = app.screen.height / 2;
        });
    });
    
    console.log("Parallax wallpaper {wallpaper_id} initialized with {sprite_count} layers");
}

// Start the initialization process
initializeWallpaper();