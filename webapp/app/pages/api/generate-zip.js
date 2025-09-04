// webapp/app/pages/api/generate-zip.js
import JSZip from 'jszip';

export default async function handler(req, res) {
  console.log(`[API] Received request for generate-zip: ${req.method}`);
  if (req.method === 'POST') {
    const { workshopLink, id } = req.body; // Accept either workshopLink or id
    console.log(`[API] Generating zip for workshopLink: ${workshopLink} or ID: ${id}`);

    if (!workshopLink && !id) {
      return res.status(400).json({ error: 'Missing workshopLink or id in request body.' });
    }

    // Determine the ID to use for simulation
    const simulatedId = id || workshopLink?.split('/').pop() || 'simulated_wallpaper';
    console.log(`[API] Simulated ID for zip generation: ${simulatedId}`);

    // --- Start: Simulated ZIP Generation ---
    const zip = new JSZip();

    // index.html
    zip.file('index.html', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulated Wallpaper</title>
    <style>
        body {
            background-color: #1a1a1a;
            color: #f0f0f0;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
        }
        h1 {
            color: #007bff;
        }
        p {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Simulated Wallpaper Content</h1>
    <p>This is a placeholder HTML file for the simulated wallpaper ID: ${simulatedId}.</p>
    <p>Real content would be generated here.</p>
    <script src="script.js"></script>
    <script>
        console.log('index.html loaded for simulated wallpaper ID: ${simulatedId}');
    </script>
</body>
</html>
    `);

    // script.js
    zip.file('script.js', `
console.log('script.js loaded. This is a simulated script for wallpaper ID: ${simulatedId}.');
console.log('In a real scenario, this would contain interactive elements or logic.');
    `);

    // assets/preview.png (placeholder)
    // In a real scenario, you'd fetch or generate this image. For simulation, use a tiny transparent pixel or a base64 encoded placeholder.
    // For simplicity, we'll just create a dummy file.
    // NOTE: For actual image data, you'd need to load a real image or generate one.
    // Using a very small base64 encoded transparent PNG for demonstration.
    const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    zip.file('assets/preview.png', transparentPngBase64, { base64: true });

    // readme.md
    zip.file('readme.md', `
# Simulated Wallpaper Export

This ZIP file contains simulated content for the Wallpaper Engine Web Exporter.

**ID:** ${simulatedId}

**Features are currently simulated.** In a full implementation, this would contain the actual converted wallpaper files and assets.

**Contents:**
- \`index.html\`: The main entry point for the web wallpaper.
- \`script.js\`: Placeholder for interactive JavaScript.
- \`assets/preview.png\`: A placeholder preview image.
- \`readme.md\`: This file.
- \`debug.json\`: Placeholder for detector output summary.

**Future Enhancements:**
- Real unpacking and conversion of Wallpaper Engine content.
- Dynamic generation of \`index.html\` and \`script.js\` based on wallpaper type.
- Inclusion of all necessary assets (images, videos, shaders).
    `);

    // debug.json
    zip.file('debug.json', `
{
  "simulated_detector_output": "This is a placeholder for the detector output summary.",
  "wallpaper_id": "${simulatedId}",
  "status": "simulated_success",
  "timestamp": "${new Date().toISOString()}"
}
    `);

    // Generate the ZIP file as a Node.js Buffer
    console.log(`[API] Generating simulated zip for ID: ${simulatedId}`);
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    console.log(`[API] Simulated zip generated with size: ${content.length} bytes`);

    // --- End: Simulated ZIP Generation ---

    // --- Start: Real RePKG/Generation Placeholder ---
    // TODO: In a production environment, this is where you would integrate
    // the actual RePKG (Reverse Package Generator) or other server-side
    // logic to unpack and convert the Wallpaper Engine file.
    //
    // Example:
    // const realWallpaperData = await unpackWallpaper(simulatedId);
    // const generatedFiles = await generateWebFiles(realWallpaperData);
    // const finalZipContent = await createZipFromGeneratedFiles(generatedFiles);
    // --- End: Real RePKG/Generation Placeholder ---

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="wallpaper_export_${simulatedId}.zip"`,
      'Content-Length': content.length,
    });
    return res.end(content);

  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    console.warn(`[API] Method ${req.method} not allowed for generate-zip.`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}