# 🌌 WallpaperEngine-WebExporter
**Convert Wallpaper Engine scene wallpapers into web-ready interactive backgrounds.**

## 🚀 Why?
Wallpaper Engine is loved by millions for its dynamic, parallax, and 3D scene wallpapers.  
But those beautiful scenes are **locked to Windows + DirectX**, with no way to bring them to websites, portfolios, or cross-platform apps.

`wall2web` solves this by **pre-rendering and optimizing Wallpaper Engine `.pkg` scene wallpapers for the web**, generating lightweight HTML + JS templates that run smoothly in any browser.

## ✨ Features (Planned)
- 📦 **Unpack `.pkg` files** → extract textures, layers, shaders.
- 🖼 **Parse `project.json` configs** → read parallax depth, scene settings.
- 🎥 **Pre-render heavy effects** → export as looping WebM/MP4 or spritesheets.
- 🌐 **Generate website template** (Three.js / Pixi.js):
  - Background video or parallax layers
  - Mouse/scroll driven interactivity
  - Optional particle overlays
- ⚡ **Optimized for the web** → compressed assets, lazy loading, fallbacks.

## 📂 Project Structure
```

wall2web/
├─ assets/To\_convert/   # Drop your Wallpaper Engine folders here
│   ├─ wallpaper1/
│   │   ├─ project.json
│   │   ├─ scene.pkg
│   │   └─ shaders/
│   └─ wallpaper2/...
├─ converter/           # Scripts for unpacking and processing
├─ output/              # Generated web-ready wallpapers
└─ README.md

````

## 🛠 How It Works
1. Drop your favorite Wallpaper Engine wallpaper folders into `assets/To_convert/`.
2. Run the converter script:
   ```bash
   python converter/unpack_pkg.py
````

3. Open `/output/wallpaper-name/index.html` in your browser.
4. 🎉 Enjoy your Wallpaper Engine scene running in the browser!

## 🧭 Roadmap

* [ ] Basic `.pkg` unpacker
* [ ] Preview renderer (static image / video background)
* [ ] Parallax layer support (mouse/scroll)
* [ ] Particle emitter support
* [ ] Shader translation (HLSL → GLSL/WebGL)
* [ ] One-click deployment (Vercel/Netlify)

## 🤝 Contributing

We’re building this step by step. PRs, ideas, and experiments are welcome!
Help us unlock Wallpaper Engine scenes for the open web.

## 📜 License

MIT License – use it, remix it, share it.
