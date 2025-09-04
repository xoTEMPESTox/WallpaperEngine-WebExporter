// webapp/app/pages/api/fetch-workshop.js

export default async function handler(req, res) {
  console.log(`[API] Received request for fetch-workshop: ${req.method}`);
  if (req.method === 'POST') {
    const { workshopLink } = req.body;
    console.log(`[API] Simulating fetch for workshopLink: ${workshopLink}`);

    if (!workshopLink) {
      return res.status(400).json({ error: 'Missing workshopLink in request body.' });
    }

    // Simulate parsing Steam Workshop ID
    let workshopId = '';
    const steamWorkshopUrlRegex = /(?:id=|app_id=)?(\d+)/;
    const match = workshopLink.match(steamWorkshopUrlRegex);
    if (match && match[1]) {
      workshopId = match[1];
    } else {
      workshopId = 'simulated_id_12345'; // Fallback for direct ID or invalid link
    }
    console.log(`[API] Parsed workshopId: ${workshopId}`);

     // Simulate fetching and parsing metadata
     const simulatedMetadata = {
      title: `Simulated Title for ID: ${workshopId}`,
      author: 'Simulated Author',
      previewImage: '/placeholder1.png', // Reference a local placeholder image
      description: 'This is a simulated description for the workshop item. Real content would be fetched here.',
      resolution: '1920x1080',
      tags: ['simulated', 'wallpaper', 'web-exporter'],
      workshopId: workshopId,
    };

    // Return simulated metadata
    console.log(`[API] Returning simulated metadata for ID: ${simulatedMetadata.workshopId}`);
    return res.status(200).json(simulatedMetadata);
  } else {
    // Handle any other HTTP method
    console.warn(`[API] Method ${req.method} not allowed for fetch-workshop.`);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}