// This script will be dynamically generated.
// It initializes Pixi.js, loads parallax layers, and implements mouse-based parallax.

window.onload = () => {
    // Pixi.js Application setup
    const app = new PIXI.Application({
        resizeTo: window, // Automatically resize to fill the window
        backgroundColor: 0x000000, // Black background
        antialias: true
    });
    document.body.appendChild(app.view);

    // Array to hold parallax layers
    const layers = [];

    // Placeholder for dynamic image loading and parallax logic
    // Images will be loaded and added here by the serverless function.
    // Each layer will have a 'depth' property to control its movement.

    // Example structure for a layer:
    // const layer1 = PIXI.Sprite.from('assets/layer1.png');
    // layer1.anchor.set(0.5);
    // layer1.x = app.screen.width / 2;
    // layer1.y = app.screen.height / 2;
    // layer1.depth = 0.1; // Smaller value for background layers, larger for foreground
    // layers.push(layer1);
    // app.stage.addChild(layer1);

    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    // Parallax update on each frame
    app.ticker.add(() => {
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        const offsetX = (mouseX - centerX) * 0.005; // Adjust multiplier for sensitivity
        const offsetY = (mouseY - centerY) * 0.005;

        layers.forEach(layer => {
            // Apply parallax effect based on depth
            layer.x = centerX + (offsetX * layer.depth * app.screen.width);
            layer.y = centerY + (offsetY * layer.depth * app.screen.height);
        });
    });

    // Handle window resizing
    window.addEventListener('resize', () => {
        // Pixi's resizeTo: window handles the app.renderer.resize automatically
        // Re-center layers if necessary, though anchor.set(0.5) helps maintain center
        layers.forEach(layer => {
            layer.x = app.screen.width / 2;
            layer.y = app.screen.height / 2;
        });
    });
};