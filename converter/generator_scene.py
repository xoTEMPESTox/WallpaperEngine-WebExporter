import json
import os
import shutil

class SceneGenerator:
    def __init__(self, ir_path, output_dir):
        with open(ir_path, 'r') as f:
            self.ir = json.load(f)
        self.output_dir = output_dir
        self.assets_dir = os.path.join(self.output_dir, 'assets')
        os.makedirs(self.assets_dir, exist_ok=True)

    def generate(self):
        self._copy_assets()
        self._generate_js()
        self._generate_html()
        self._generate_readme()
        self._generate_debug_json()

    def _copy_assets(self):
        """
        Recursively find all file paths in the IR and copy them to the assets folder.
        Updates the IR to point to the new relative asset paths.
        """
        def find_and_copy_assets(data):
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, str) and os.path.exists(value):
                        if os.path.isfile(value):
                            asset_filename = os.path.basename(value)
                            dest_path = os.path.join(self.assets_dir, asset_filename)
                            shutil.copy(value, dest_path)
                            # Update IR to use absolute path for web
                            data[key] = f'./assets/{asset_filename}'
                    elif isinstance(value, (dict, list)):
                        find_and_copy_assets(value)
            elif isinstance(data, list):
                for item in data:
                    find_and_copy_assets(item)

        find_and_copy_assets(self.ir)

    def _generate_js(self):
        js_content = f"""
const assets = {json.dumps([item for item in self._collect_asset_paths()])};

PIXI.Assets.load(assets).then(setup);

let app; // Declare app globally or in a scope accessible by other functions

function setup() {{
    app = new PIXI.Application({{
        width: window.innerWidth,
        height: window.innerHeight,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
    }});
    document.body.appendChild(app.view);

    // Resize function
    window.addEventListener('resize', () => {{
        app.renderer.resize(window.innerWidth, window.innerHeight);
    }});

    // Layer stack reconstruction
    const layers = {json.dumps(self.ir.get('layers', []))};
    layers.forEach(layerData => {{
        const sprite = PIXI.Sprite.from(layerData.file);
        sprite.anchor.set(0.5);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        
        if (layerData.depth) {{
            sprite.z = layerData.depth;
        }}

        app.stage.addChild(sprite);
    }});

    // Parallax
    app.stage.interactive = true;
    app.stage.on('pointermove', (e) => {{
        const {{ x, y }} = e.data.global;
        app.stage.children.forEach(child => {{
            if (child.z) {{
                const moveX = (x - app.screen.width / 2) * child.z * 0.1;
                const moveY = (y - app.screen.height / 2) * child.z * 0.1;
                child.position.x = app.screen.width / 2 + moveX;
                child.position.y = app.screen.height / 2 + moveY;
            }}
        }});
    }});

    app.ticker.add((delta) => {{
        // Update logic here
    }});

    // Clock Widget
    if ({json.dumps('clock' in [ui.get('type') for ui in self.ir.get('ui', [])])}) {{
        const clock = new PIXI.Text('00:00:00', {{fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center'}});
        clock.x = app.screen.width - 100;
        clock.y = 50;
        app.stage.addChild(clock);

        app.ticker.add(() => {{
            const now = new Date();
            clock.text = now.toLocaleTimeString();
        }});
    }}

    // Audio Visualizer
    if ({json.dumps('audio' in self.ir)}) {{
        // Placeholder for audio visualizer
        console.log("Audio data found, visualizer implementation pending.");
    }}
}}
"""
        js_path = os.path.join(self.output_dir, 'script.js')
        with open(js_path, 'w') as f:
            f.write(js_content.replace('{{', '{{').replace('}}', '}}'))

    def _generate_html(self):
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{self.ir.get('name', 'Wallpaper Engine Scene')}</title>
    <style>
        body, html {{ margin: 0; padding: 0; overflow: hidden; }}
        canvas {{ display: block; }}
    </style>
</head>
<body>
    <script src="/js/pixi.min.js"></script>
    <script defer src="./script.js"></script>
</body>
</html>
"""
        html_path = os.path.join(self.output_dir, 'index.html')
        with open(html_path, 'w') as f:
            f.write(html_content)

    def _generate_readme(self):
        readme_content = f"""
# {self.ir.get('name', 'Wallpaper Engine Scene')}

This web-based scene was generated from a Wallpaper Engine project.

## Running the Scene
Open the `index.html` file in a modern web browser.
"""
        readme_path = os.path.join(self.output_dir, 'readme.md')
        with open(readme_path, 'w') as f:
            f.write(readme_content)

    def _generate_debug_json(self):
        debug_path = os.path.join(self.output_dir, 'debug.json')
        with open(debug_path, 'w') as f:
            json.dump(self.ir, f, indent=4)

    def _collect_asset_paths(self):
        paths = set()
        def find_paths(data):
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, str) and value.startswith('./assets/'):
                        paths.add(value)
                    elif isinstance(value, (dict, list)):
                        find_paths(value)
            elif isinstance(data, list):
                for item in data:
                    find_paths(item)
        find_paths(self.ir)
        return list(paths)

if __name__ == '__main__':
    import sys

    if len(sys.argv) != 3:
        print("Usage: python generator_scene.py <ir_path> <output_dir>")
        sys.exit(1)

    ir_path = sys.argv[1]
    output_dir = sys.argv[2]

    generator = SceneGenerator(ir_path, output_dir)
    generator.generate()
    print(f"Scene generated successfully in {output_dir}")