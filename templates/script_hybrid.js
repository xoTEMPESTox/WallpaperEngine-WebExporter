// Hybrid Wallpaper Script for {wallpaper_id}
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
        backgroundColor: 0x00,
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
    
    // Load and display the main background image
    try {
        // This will be populated with the correct asset path during conversion
        const backgroundTexture = await PIXI.Assets.load('{background_image}');
        const backgroundSprite = PIXI.Sprite.from(backgroundTexture);
        
        // Position and scale the background
        backgroundSprite.anchor.set(0.5);
        backgroundSprite.x = app.screen.width / 2;
        backgroundSprite.y = app.screen.height / 2;
        
        // Scale to fit screen while maintaining aspect ratio
        const scale = Math.min(
            app.screen.width / backgroundSprite.width,
            app.screen.height / backgroundSprite.height
        );
        backgroundSprite.scale.set(scale);
        
        app.stage.addChild(backgroundSprite);
    } catch (error) {
        displayError("Failed to load background image");
    }
    
    // Load and apply effects (shaders)
    try {
        // These paths will be populated during conversion
        const effect1Frag = await fetch('{effect1_frag}').then(r => r.text());
        const effect1Vert = await fetch('{effect1_vert}').then(r => r.text());
        const effect2Frag = await fetch('{effect2_frag}').then(r => r.text());
        const effect2Vert = await fetch('{effect2_vert}').then(r => r.text());
        
        // Create filters from shaders
        const effect1Filter = new PIXI.Filter(effect1Vert, effect1Frag);
        const effect2Filter = new PIXI.Filter(effect2Vert, effect2Frag);
        
        // Apply filters to the stage or specific sprites
        app.stage.filters = [effect1Filter, effect2Filter];
        
        console.log("Effects loaded successfully");
    } catch (error) {
        displayError("Failed to load effects");
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
    
    console.log("Hybrid wallpaper {wallpaper_id} initialized");
}

// Start the initialization process
initializeWallpaper();