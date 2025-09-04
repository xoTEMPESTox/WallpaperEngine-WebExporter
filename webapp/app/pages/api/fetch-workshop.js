// webapp/app/pages/api/fetch-workshop.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import path from 'path';
import { promises as fs } from 'fs';

const STEAM_WORKSHOP_URL = 'https://steamcommunity.com/sharedfiles/filedetails/?id=';
const MAX_FILE_SIZE_MB = 250; // 250MB limit for serverless functions
const DOWNLOAD_TIMEOUT_MS = 60000; // 60 seconds timeout for downloads

// Utility function to sanitize filenames
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_.-]/gi, '_');
}

export default async function handler(req, res) {
  console.log(`[API] Received request for fetch-workshop: ${req.method}`);
  if (req.method === 'POST') {
    const { workshopLink } = req.body;
    console.log(`[API] Attempting to fetch for workshopLink: ${workshopLink}`);

    if (!workshopLink) {
        console.error(`[API] Missing workshopLink in request for ${req.method}.`);
        return res.status(400).json({ error: 'Missing workshopLink in request body.' });
    }

    let workshopId;
    try {
        // Robust ID parsing: handles full URLs, IDs, and various Steam Workshop URL formats
        const workshopUrlRegex = /(?:steamcommunity\.com\/sharedfiles\/filedetails\/\?id=|workshop\/filedetails\/\?id=|id=)?(\d+)/;
        const match = workshopLink.match(workshopUrlRegex);
        if (match && match[1]) {
            workshopId = match[1];
        } else {
            // If it's just a number, use it as the ID
            if (/^\d+$/.test(workshopLink)) {
                workshopId = workshopLink;
            } else {
                return res.status(400).json({ error: 'Invalid Steam Workshop link or ID provided.' });
            }
        }
        console.log(`[API] Successfully parsed workshopId: ${workshopId}`);
    } catch (error) {
        console.error(`[API] Error parsing workshop ID from "${workshopLink}": ${error.message}`);
        return res.status(400).json({ error: 'Failed to parse Steam Workshop ID. Please provide a valid link or ID.' });
    }

    const workshopPageUrl = `${STEAM_WORKSHOP_URL}${workshopId}`;
    let htmlContent;

    try {
      const response = await fetch(workshopPageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      htmlContent = await response.text();
    } catch (error) {
      console.error(`[API] Error fetching workshop page ${workshopPageUrl}: ${error.message}`);
      return res.status(500).json({
        error: 'Failed to fetch Steam Workshop page. Please check the link and try again.',
        fallback: {
          type: 'user_upload',
          message: 'Could not fetch workshop details. Please download the .pkg or .zip file and upload it via the /convert page.'
        }
      });
    }
    console.log(`[API] Successfully fetched HTML content for workshop ID: ${workshopId}`);

    const $ = cheerio.load(htmlContent);
    let metadata = {};

    try {
      metadata.title = $('div.workshopItemTitle').text().trim() || 'Unknown Title';
      metadata.author = $('div.apphub_CardContentAuthorName a').text().trim() || 'Unknown Author';
      metadata.authorProfileUrl = $('div.apphub_CardContentAuthorName a').attr('href') || '#';
      metadata.previewImage = $('img.workshopItemPreviewImage').attr('src') || $('div.screenshot_holder img').attr('src') || '/placeholder1.png'; // Fallback to a local placeholder if no image found

      // Attempt to find description and resolution (example, adjust selectors as needed)
      metadata.description = $('div.workshopItemDescription').text().trim() || 'No description available.';
      // This is a placeholder for resolution, typically not directly in HTML easily
      metadata.resolution = 'N/A';
      
      // Attempt to find tags
      metadata.tags = [];
      $('div.tag_item').each((i, el) => {
        metadata.tags.push($(el).text().trim());
      });

      metadata.workshopId = workshopId;

      console.log(`[API] Parsed metadata for ID ${workshopId}:`, metadata);

    } catch (parseError) {
      console.error(`[API] Error parsing metadata for workshop ID ${workshopId}: ${parseError.message}`);
      // Continue with partial metadata or fallback
    }
   console.log(`[API] Metadata parsing complete for workshop ID ${workshopId}.`);

    // Attempt to find a direct download link for .pkg or .zip (Option B - Proxy Fetch)
    // Note: Steam Workshop does not typically provide direct public CDN links for wallpaper files.
    // This part is illustrative for a scenario where such links *might* exist.
    const directDownloadLink = $('a[href$=".pkg"], a[href$=".zip"]').attr('href');
    if (directDownloadLink) {
        console.log(`[API] Found potential direct download link: ${directDownloadLink}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

            const fileResponse = await fetch(directDownloadLink, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.status}`);
            }

            const contentLength = fileResponse.headers.get('content-length');
            const fileSizeMB = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;

            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                console.warn(`[API] File size (${fileSizeMB.toFixed(2)}MB) for ${workshopId} exceeds limit of ${MAX_FILE_SIZE_MB}MB. Instructing user for manual upload.`);
                return res.status(200).json({
                    ...metadata,
                    status: 'file_too_large',
                    message: `File is too large (${fileSizeMB.toFixed(2)}MB). Please use the local CLI for conversion or download and upload manually.`,
                    fallback: {
                        type: 'user_upload',
                        message: 'File too large for direct download. Please download the .pkg or .zip file and upload it via the /convert page, or use the local CLI.'
                    }
                });
            }

            // Save file to /tmp for staging
            const filename = sanitizeFilename(`${workshopId}${path.extname(directDownloadLink) || '.pkg'}`);
            const tempFilePath = path.join('/tmp', filename);

            const arrayBuffer = await fileResponse.arrayBuffer();
            await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

            console.log(`[API] Successfully downloaded and staged file to ${tempFilePath}`);

            return res.status(200).json({
                ...metadata,
                status: 'file_staged',
                message: 'File successfully downloaded and staged for conversion.',
                filePath: tempFilePath // Pass the temporary file path for generate-zip to use
            });

        } catch (fileFetchError) {
            console.error(`[API] Error during proxy file fetch or staging for ${workshopId}: ${fileFetchError.message}`);
            if (fileFetchError.name === 'AbortError') {
                console.error(`[API] File download for ${workshopId} timed out.`);
            }
            // Fallback to user upload if proxy fetch fails
            return res.status(200).json({
                ...metadata,
                status: 'proxy_fetch_failed',
                message: 'Failed to proxy download the file. Please download it locally and upload via the /convert page.',
                fallback: {
                    type: 'user_upload',
                    message: 'Failed to proxy download. Please download the .pkg or .zip file and upload it via the /convert page.'
                }
            });
        }
    } else {
        // Fallback Option A: Instruct client to download and upload if no direct link found
        console.log(`[API] No direct download link found for ${workshopId}. Falling back to user upload.`);
        return res.status(200).json({
            ...metadata,
            status: 'metadata_fetched',
            message: 'Metadata fetched successfully. For the actual wallpaper file, please download the .pkg or .zip locally and upload it via the /convert page.',
            fallback: {
                type: 'user_upload',
                message: 'Please download the .pkg or .zip file and upload it via the /convert page.'
            }
        });
    }
    console.log(`[API] Successfully processed fetch-workshop request for ID: ${workshopId}`);
  } else {
    console.warn(`[API] Method ${req.method} not allowed for fetch-workshop.`);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}