const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DEMO_IDS = [
    '951259031',
    '1198839373',
    '1959836574',
    '2234989491',
    '2504353624',
    '2649428881',
    '2911866381',
    '3036895455',
    '3111326350',
    '3210875135',
    '3223077541',
    '3252400200'
];

const WORKSHOP_BASE_URL = 'https://steamcommunity.com/sharedfiles/filedetails/?id=';
const OUTPUT_FILE = path.join(__dirname, '../../docs/demo_wallpapers.json');

async function scrapeWorkshopPage(id) {
    const url = `${WORKSHOP_BASE_URL}${id}`;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('.workshopItemTitle').text().trim();
        const authorName = $('.friendBlockContent a').first().text().trim();
        const authorProfileURL = $('.friendBlockContent a').first().attr('href');
        const previewImageURL = $('.workshopItemPreviewImageEnlargeable').attr('src');
        const descriptionSnippet = $('.workshopItemDescription').text().trim().split('\n')[0];
        
        let resolution = null;
        // Attempt to find resolution in the description or elsewhere
        const descriptionText = $('.workshopItemDescription').text();
        const resolutionMatch = descriptionText.match(/(\d{3,4}x\d{3,4})/i);
        if (resolutionMatch) {
            resolution = resolutionMatch[1];
        } else {
            // Fallback for resolution - sometimes it's in the tags or other elements
            // This is a basic attempt, might need more specific selectors for robust detection
            $('.tag').each((i, elem) => {
                const tagText = $(elem).text();
                const tagResolutionMatch = tagText.match(/(\d{3,4}x\d{3,4})/i);
                if (tagResolutionMatch) {
                    resolution = tagResolutionMatch[1];
                    return false; // Break loop
                }
            });
        }


        return {
            id,
            title,
            authorName,
            authorProfileURL,
            previewImageURL,
            descriptionSnippet,
            resolution,
            simulated: false
        };
    } catch (error) {
        console.error(`Failed to scrape ID ${id}: ${error.message}`);
        return {
            id,
            title: `Simulated Demo ${id}`,
            authorName: 'Unknown',
            authorProfileURL: url,
            previewImageURL: '', // Placeholder or link to a generic error image
            descriptionSnippet: 'Failed to scrape metadata. This is a simulated entry.',
            resolution: null,
            simulated: true
        };
    }
}

async function collectDemoMetadata() {
    const allMetadata = [];
    for (const id of DEMO_IDS) {
        const metadata = await scrapeWorkshopPage(id);
        allMetadata.push(metadata);
    }
    return allMetadata;
}

async function saveMetadata(metadata) {
    try {
        // Ensure the directory exists
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
        console.log(`Metadata successfully saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Failed to save metadata: ${error.message}`);
    }
}

async function main() {
    console.log('Starting demo metadata collection...');
    const metadata = await collectDemoMetadata();
    await saveMetadata(metadata);
    console.log('Demo metadata collection finished.');
}

main();