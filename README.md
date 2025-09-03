# 🌌 Wallpaper Engine Web Exporter

**Convert Wallpaper Engine scene wallpapers into web-ready interactive backgrounds.**

## 📋 Table of Contents
- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Web Application](#running-the-web-application)
- [Usage](#usage)
  - [Converting from Steam Workshop](#converting-from-steam-workshop)
  - [Viewing Demos](#viewing-demos)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## 🌟 Overview

The Wallpaper Engine Web Exporter is a powerful tool that converts Wallpaper Engine projects into web-compatible formats that can run in any modern browser. This project includes both a Python-based converter for processing Wallpaper Engine projects and a Next.js web application for easy conversion and viewing of wallpapers directly in your browser.

With this exporter, you can:
- Convert your favorite Wallpaper Engine wallpapers to run in a web browser
- Share your wallpapers on the web without requiring users to install Wallpaper Engine
- Preserve interactive features like parallax effects, particle systems, and shaders
- Create self-contained web projects that work offline

## 🎥 Live Demo

Check out our [Live Demo](https://wallpaper-engine-web-exporter.vercel.app) to see the web application in action!

## ✨ Key Features

- **Multi-Layer Support**: Converts image layers with full positioning and scaling
- **Parallax Effects**: Preserves mouse-driven parallax depth effects
- **Particle Systems**: Supports particle emitters with customizable properties
- **Shader Effects**: Handles WebGL shaders for advanced visual effects
- **Cross-Platform**: Generated wallpapers run in all modern browsers (Chrome, Firefox, Safari, Edge)
- **No External Dependencies**: Output is completely self-contained with no CDN requirements
- **Preserves Interactivity**: Maintains mouse interactions and animations
- **Lightweight Output**: Optimized web-ready files with minimal overhead
- **Steam Workshop Integration**: Direct conversion from Steam Workshop links

## 🗂 Project Structure

```
WallpaperEngine-WebExporter/
├── converter/              # Python-based conversion tools
├── webapp/                 # Next.js web application
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── lib/                # Utility functions and libraries
│   └── public/             # Static assets and demo wallpapers
├── docs/                   # Documentation files
├── output/                 # Converted wallpaper output
├── src/                    # Core engine source code
└── templates/              # HTML template files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 16+** for the web application
- **Python 3.6+** for the converter (optional, if using Python tools)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/WallpaperEngine-WebExporter.git
   cd WallpaperEngine-WebExporter
   ```

2. Install dependencies for the web application:
   ```bash
   cd webapp
   npm install
   ```

### Running the Web Application

To run the Next.js web application locally:

```bash
cd webapp
npm run dev
```

Then open your browser to `http://localhost:3000` to access the web interface.

## 🛠 Usage

### Converting from Steam Workshop

1. Visit the "Convert" page in the web application
2. Enter a Steam Workshop link or ID (e.g., `https://steamcommunity.com/sharedfiles/filedetails/?id=123456789` or `123456789`)
3. Click "Convert" to start the process
4. Download the converted wallpaper as a ZIP file

### Viewing Demos

1. Visit the "Demos" page in the web application
2. Browse through the available demo wallpapers
3. Click on any demo to view it in full screen

## 📚 Documentation

For more detailed information, please refer to the documentation in the `docs/` directory:

- [User Guide](docs/user_guide.md) - Instructions for using the converter
- [API Documentation](docs/api_documentation.md) - Detailed documentation for the JavaScript rendering engine
- [Technical Specification](technical_specification.md) - In-depth technical details about the architecture

## 🤝 Contributing

We welcome contributions to the Wallpaper Engine Web Exporter! Please read our [Contributing Guidelines](CONTRIBUTING.md) for information on how to get started.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License Summary:
- Free to use, modify, and distribute
- Must include original copyright and license notice
- Provided "as is" without warranties
- Not liable for damages

## 🙏 Acknowledgements

- [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) by Kristjan Skutta - The amazing software that makes these wallpapers possible
- All the Wallpaper Engine community creators who have shared their wonderful work
- The open-source community for providing excellent tools and libraries

---

*Convert your favorite Wallpaper Engine scenes and bring them to the web!*
