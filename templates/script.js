/**
 * Wallpaper Engine to Web - Universal Renderer
 * 
 * This single script handles all wallpaper types (video, parallax, hybrid)
 * based on a configuration object provided in the HTML.
 */

// Main initialization function
async function initializeWallpaper() {
    const container = document.getElementById('wallpaper-container');
    if (!container) {
        // Poll until the container is ready
        requestAnimationFrame(initializeWallpaper);
        return;
    }

    const config = window.wallpaperConfig;
    if (!config) {
        displayError('Wallpaper configuration object not found.');
        return;
    }

    // Route to the correct renderer based on type
    switch (config.type) {
        case 'video':
            initVideo(container, config);
            break;
        case 'parallax':
            await initPixi(container, config, initParallax);
            break;
        case 'hybrid':
            await initPixi(container, config, initHybrid);
            break;
        default:
            displayError(`Unknown wallpaper type: ${config.type}`);
    }
}

// --- Renderers ---

function initVideo(container, config) {
    const video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.position = 'absolute';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    if (config.assets.video) {
        const source = document.createElement('source');
        source.src = config.assets.video;
        source.type = 'video/mp4'; // Assuming mp4 for simplicity
        video.appendChild(source);
    } else {
        displayError('No video asset specified in config.');
        return;
    }

    container.appendChild(video);
    console.log(`Video wallpaper ${config.id} initialized.`);
}

async function initPixi(container, config, renderer) {
    try {
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            resizeTo: window,
            antialias: true,
            backgroundColor: 0x000000,
        });
        container.appendChild(app.view);

        await renderer(app, config);

        console.log(`${config.type} wallpaper ${config.id} initialized.`);
    } catch (error) {
        displayError(`Failed to initialize PixiJS for ${config.type} wallpaper.`);
        console.error(error);
    }
}

async function initParallax(app, config) {
    const layers = [];
    for (const layerConfig of config.assets.images) {
        try {
            const texture = await PIXI.Assets.load(layerConfig.url);
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.x = app.screen.width / 2;
            sprite.y = app.screen.height / 2;
            
            const scale = Math.max(app.screen.width / sprite.width, app.screen.height / sprite.height) * 1.1;
            sprite.scale.set(scale);

            sprite.parallaxDepth = layerConfig.depth;
            layers.push(sprite);
            app.stage.addChild(sprite);
        } catch (e) {
            displayError(`Failed to load parallax layer: ${layerConfig.url}`);
            console.error(e);
        }
    }

    // Mouse move handler
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointermove', (event) => {
        const mouseX = (event.global.x / window.innerWidth) - 0.5;
        const mouseY = (event.global.y / window.innerHeight) - 0.5;
        layers.forEach(layer => {
            layer.x = app.screen.width / 2 + mouseX * layer.parallaxDepth * 50;
            layer.y = app.screen.height / 2 + mouseY * layer.parallaxDepth * 50;
        });
    });
}

async function initHybrid(app, config) {
    // Background
    if (config.assets.images && config.assets.images.length > 0) {
        try {
            const bgTexture = await PIXI.Assets.load(config.assets.images[0].url);
            const bgSprite = new PIXI.Sprite(bgTexture);
            bgSprite.anchor.set(0.5);
            bgSprite.x = app.screen.width / 2;
            bgSprite.y = app.screen.height / 2;
            const scale = Math.min(app.screen.width / bgSprite.width, app.screen.height / bgSprite.height);
            bgSprite.scale.set(scale);
            app.stage.addChild(bgSprite);
        } catch(e) {
            displayError(`Failed to load background: ${config.assets.images[0].url}`);
            console.error(e);
        }
    }

    // Shaders/Filters
    if (config.assets.shaders && config.assets.shaders.length > 0) {
        const filters = [];
        for (const shader of config.assets.shaders) {
            try {
                const vert = await fetch(shader.vert).then(r => r.text());
                const frag = await fetch(shader.frag).then(r => r.text());
                filters.push(new PIXI.Filter(vert, frag));
            } catch(e) {
                displayError(`Failed to load shader: ${shader.frag}`);
                console.error(e);
            }
        }
        app.stage.filters = filters;
    }
}


// --- Utility ---

function displayError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    console.error(message);
}

// Start the process
initializeWallpaper();