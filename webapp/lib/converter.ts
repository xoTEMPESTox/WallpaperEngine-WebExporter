import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Extracts the Steam Workshop ID from a URL or returns the ID if it's already provided
 * @param input - Steam Workshop URL or ID
 * @returns Steam Workshop ID
 */
export function extractWorkshopId(input: string): string {
  // If it's already a numeric ID, return it
  if (/^\d+$/.test(input.trim())) {
    return input.trim();
  }
  
  // Try to extract ID from URL
  const urlPattern = /(?:steamcommunity\.com\/sharedfiles\/filedetails\/\?id=)(\d+)/;
  const match = input.match(urlPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  throw new Error('Invalid Steam Workshop URL or ID format');
}

/**
 * Fetches a wallpaper file from the Steam CDN
 * @param workshopId - Steam Workshop ID
 * @returns Promise that resolves to the wallpaper file as ArrayBuffer
 */
export async function fetchWallpaperFile(workshopId: string): Promise<ArrayBuffer> {
  const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`;
  
  try {
    // First, we need to get the download link from the Steam page
    let response = await fetch(url);
    let html = await response.text();
    
    // Extract the download link from the HTML
    // This is a simplified approach - in reality, Steam uses more complex mechanisms
    const downloadLinkPattern = /href="(https:\/\/steamusercontent[^"]+\.zip)"/;
    const match = html.match(downloadLinkPattern);
    
    if (match && match[1]) {
      // Try direct fetch first
      try {
        const fileResponse = await fetch(match[1]);
        return await fileResponse.arrayBuffer();
      } catch (directError) {
        // If direct fetch fails (likely due to CORS), try using the proxy
        console.log('Direct fetch failed, trying proxy...');
        const proxyUrl = `/api/steam-proxy?url=${encodeURIComponent(match[1])}`;
        const fileResponse = await fetch(proxyUrl);
        
        if (!fileResponse.ok) {
          throw new Error(`Proxy fetch failed with status ${fileResponse.status}`);
        }
        
        return await fileResponse.arrayBuffer();
      }
    } else {
      throw new Error('Could not find download link for the wallpaper');
    }
  } catch (error) {
    console.error('Error fetching wallpaper file:', error);
    throw new Error(`Failed to fetch wallpaper file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Unpacks a wallpaper .zip file (simplified version since we can't run RePKG in browser)
 * @param zipBuffer - The wallpaper .zip file as ArrayBuffer
 * @returns Promise that resolves to the unpacked files
 */
export async function unpackWallpaperZip(zipBuffer: ArrayBuffer): Promise<{ [filename: string]: ArrayBuffer }> {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipBuffer);
    
    const files: { [filename: string]: ArrayBuffer } = {};
    
    // Extract all files from the zip
    const filePromises: Promise<void>[] = [];
    
    loadedZip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        filePromises.push(
          zipEntry.async('arraybuffer').then((content) => {
            files[relativePath] = content;
          })
        );
      }
    });
    
    await Promise.all(filePromises);
    return files;
  } catch (error) {
    console.error('Error unpacking wallpaper zip:', error);
    throw new Error(`Failed to unpack wallpaper zip: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes unpacked wallpaper files to create a web-compatible project
 * @param files - Object containing filename -> ArrayBuffer mappings
 * @returns Promise that resolves to the processed project files
 */
export async function processWallpaperFiles(files: { [filename: string]: ArrayBuffer }): Promise<{ [filename: string]: Blob | string }> {
  try {
    // Find project.json or scene.json
    let projectData: any = null;
    let projectFileName = '';
    
    for (const filename in files) {
      if (filename.endsWith('project.json') || filename.endsWith('scene.json')) {
        const content = new TextDecoder().decode(files[filename]);
        projectData = JSON.parse(content);
        projectFileName = filename;
        break;
      }
    }
    
    if (!projectData) {
      throw new Error('Could not find project.json or scene.json in the wallpaper package');
    }
    
    // Process the project data to make it web-compatible
    const processedFiles: { [filename: string]: Blob | string } = {};
    
    // Create the new project.json structure
    const newProjectData = {
      projectInfo: {
        name: projectData.title || 'Untitled',
        id: projectFileName.split('/')[0] || 'unknown',
        file: projectData.file,
        preview: projectData.preview,
      },
      assets: { images: {} as { [key: string]: string }, videos: {}, models: {} },
      layers: [],
      userProperties: projectData.general?.properties || {},
    };
    
    // Process layers and assets (simplified implementation)
    if (projectData.objects) {
      newProjectData.layers = projectData.objects.map((obj: any, index: number) => {
        const layerName = obj.name || `Layer ${index}`;
        
        // Handle different layer types
        if (obj.particle) {
          return {
            name: layerName,
            type: 'particles',
            particleSettings: {
              emissionRate: 10,
              lifetime: 5,
              velocity: { x: 0, y: 0 },
              color: '#FFFFFF',
              size: 2,
              spread: 0
            },
            transform: {
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: 0,
            },
            effects: [],
          };
        } else if (obj.image || obj.file) {
          const assetKey = layerName;
          const assetFile = obj.image || obj.file;
          
          // Add to assets if the file exists
          if (files[assetFile]) {
            newProjectData.assets.images[assetKey] = `assets/${assetFile.split('/').pop()}`;
          }
          
          return {
            name: layerName,
            type: 'image',
            asset_key: assetKey,
            transform: {
              position: obj.origin ? obj.origin.split(' ').map(Number) : [0, 0, 0],
              scale: obj.scale ? obj.scale.split(' ').map(Number) : [1, 1, 1],
              rotation: obj.angles ? Number(obj.angles.split(' ')[2]) : 0,
            },
            effects: [],
          };
        }
        
        // Default layer
        return {
          name: layerName,
          type: 'image',
          transform: {
            position: [0, 0, 0],
            scale: [1, 1, 1],
            rotation: 0,
          },
          effects: [],
        };
      });
    }
    
    // Add the processed project.json
    processedFiles['project.json'] = JSON.stringify(newProjectData, null, 2);
    
    // Copy asset files
    for (const filename in files) {
      // Skip project files that we've already processed
      if (filename.endsWith('project.json') || filename.endsWith('scene.json')) {
        continue;
      }
      
      // Add asset files
      if (
        filename.endsWith('.png') || 
        filename.endsWith('.jpg') || 
        filename.endsWith('.jpeg') || 
        filename.endsWith('.gif') || 
        filename.endsWith('.webp') ||
        filename.endsWith('.mp4') || 
        filename.endsWith('.webm') ||
        filename.endsWith('.json') // For model files
      ) {
        const assetPath = `assets/${filename.split('/').pop()}`;
        processedFiles[assetPath] = new Blob([files[filename]], { type: getMimeType(filename) });
      }
    }
    
    return processedFiles;
  } catch (error) {
    console.error('Error processing wallpaper files:', error);
    throw new Error(`Failed to process wallpaper files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the MIME type for a file based on its extension
 * @param filename - Name of the file
 * @returns MIME type string
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

/**
 * Packages the processed files into a zip for download
 * @param files - Object containing filename -> Blob|string mappings
 * @param wallpaperName - Name for the wallpaper package
 * @returns Promise that resolves to the zip file as Blob
 */
export async function packageWallpaper(files: { [filename: string]: Blob | string }, wallpaperName: string): Promise<Blob> {
  try {
    const zip = new JSZip();
    
    // Add all processed files to the zip
    for (const filename in files) {
      zip.file(filename, files[filename]);
    }
    
    // Add engine files (these would be copied from the webapp/src/engine directory)
    // In a real implementation, we would fetch these files or include them as static assets
    // For now, we'll add placeholder files
    zip.file('renderer.js', '// Wallpaper Engine Renderer\n// This would contain the actual renderer code');
    zip.file('particles.js', '// Particle System\n// This would contain the actual particle system code');
    zip.file('shaders.js', '// Shader System\n// This would contain the actual shader system code');
    zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${wallpaperName}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
        }
        #scene-container {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="scene-container"></div>

    <script src="renderer.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            fetch('project.json')
                .then(response => response.json())
                .then(projectData => {
                    const container = document.getElementById('scene-container');
                    new Scene(projectData, container);
                })
                .catch(error => console.error('Error loading project data:', error));
        });
    </script>
</body>
</html>`);
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } catch (error) {
    console.error('Error packaging wallpaper:', error);
    throw new Error(`Failed to package wallpaper: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main conversion function that orchestrates the entire process
 * @param steamInput - Steam Workshop URL or ID
 * @returns Promise that resolves to the final zip file Blob
 */
export async function convertSteamWallpaper(steamInput: string): Promise<Blob> {
  try {
    // Step 1: Extract Workshop ID
    const workshopId = extractWorkshopId(steamInput);
    console.log(`Extracted Workshop ID: ${workshopId}`);
    
    // Step 2: Fetch wallpaper file
    console.log('Fetching wallpaper file...');
    const zipBuffer = await fetchWallpaperFile(workshopId);
    console.log(`Fetched ${zipBuffer.byteLength} bytes`);
    
    // Step 3: Unpack the zip file
    console.log('Unpacking wallpaper zip...');
    const files = await unpackWallpaperZip(zipBuffer);
    console.log(`Unpacked ${Object.keys(files).length} files`);
    
    // Step 4: Process files for web compatibility
    console.log('Processing files for web compatibility...');
    const processedFiles = await processWallpaperFiles(files);
    console.log(`Processed ${Object.keys(processedFiles).length} files`);
    
    // Step 5: Package into final zip
    console.log('Packaging final zip...');
    const wallpaperName = processedFiles['project.json'] 
      ? JSON.parse(processedFiles['project.json'] as string).projectInfo.name 
      : 'Wallpaper';
    
    const finalZip = await packageWallpaper(processedFiles, wallpaperName);
    console.log('Conversion completed successfully!');
    
    return finalZip;
  } catch (error) {
    console.error('Error in conversion process:', error);
    throw error;
  }
}

/**
 * Downloads a wallpaper zip file
 * @param zipBlob - The zip file as Blob
 * @param filename - Name for the downloaded file
 */
export function downloadWallpaper(zipBlob: Blob, filename: string): void {
  saveAs(zipBlob, `${filename}.zip`);
}