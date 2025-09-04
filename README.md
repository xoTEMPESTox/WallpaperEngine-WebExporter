# WALLPAPERENGINE-WEBEXPORTER

This project aims to provide a UI-first MVP for a Wallpaper Engine web exporter.

## Credits

### Demo Wallpapers
*   **firewatch**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=951259031)
*   **Cabin by the lake**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=1198839373)
*   **In The Early Morning Forest**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=1959836574)
*   **Mountain Clock and Audio - Elegant Clean Look**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=2234989491)
*   **Sealed**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=2504353624)
*   **Night Sky**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=2649428881)
*   **White Oak (Day/Night)**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=2911866381)
*   **Starry sky at midnight**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3036895455)
*   **Sakura, River and Full Moon**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3111326350)
*   **After Sunset [4K]**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3210875135)
*   **Circular Black Hole [4K]**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3223077541)
*   **Peaceful Lake II | Minimal Landscape**: [Steam Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3252400200)

### Dependencies
*   **RePKG**: Unpacking dependency ([https://github.com/notscuffed/repkg](https://github.com/notscuffed/repkg))
*   **Pixi.js**: Rendering library
*   **Three.js**: 3D rendering library (if used)
*   **JSZip**: For creating ZIP archives
*   **FileSaver**: For saving files client-side
*   **Next.js**: React framework
*   **Tailwind**: CSS framework
*   **Vercel**: Deployment platform

### Copyright Notice
Assets © respective artists. Converted for demo/educational purposes; support the original creators on Steam Workshop. Contact for takedown.

## Deployment Instructions

This project is designed for deployment on Vercel. Follow these steps to connect your GitHub repository and set up environment variables:

1.  **Connect GitHub to Vercel:**
    *   Log in to your [Vercel account](https://vercel.com/).
    *   Click "New Project" and import your GitHub repository.
    *   Follow the on-screen prompts to configure the project.

2.  **Set Environment Variables:**
    For future real proxy or RePKG backends, you may need to set environment variables. These should be configured in your Vercel project settings under "Settings" > "Environment Variables".
    *   Examples of potential environment variables (these are placeholders and might not be required for the current MVP):
        *   `NEXT_PUBLIC_API_URL`: URL for your backend API (e.g., for RePKG service).
        *   `REPKG_API_KEY`: API key for a secure RePKG service.
        *   `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS.

    *Make sure to set these variables for the appropriate environments (e.g., Development, Preview, Production) as needed.*