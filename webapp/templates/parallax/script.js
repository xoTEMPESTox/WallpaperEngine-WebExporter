// Basic Pixi.js initialization sample
// This script doesn't implement full parallax logic, just a minimal setup.

// Ensure Pixi.js is loaded before this script, e.g., via a CDN in index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.x.x/pixi.min.js"></script>

window.onload = () => {
    const canvas = document.getElementById('parallaxCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x1a1a1a, // Dark background
        antialias: true
    });

    // Simple graphic: a red rectangle
    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(0xFF0000); // Red color
    rectangle.drawRect(0, 0, 100, 100);
    rectangle.endFill();
    rectangle.x = app.screen.width / 2;
    rectangle.y = app.screen.height / 2;
    rectangle.pivot.x = rectangle.width / 2;
    rectangle.pivot.y = rectangle.height / 2;
    app.stage.addChild(rectangle);

    // Basic animation (optional)
    app.ticker.add(() => {
        rectangle.rotation += 0.01;
    });

    // Handle window resizing
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        rectangle.x = app.screen.width / 2;
        rectangle.y = app.screen.height / 2;
    });
};