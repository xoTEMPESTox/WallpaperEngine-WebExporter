// webapp/app/pages/api/demo-preview.js

export default function handler(req, res) {
  console.log(`[API] Received request for demo-preview: ${req.method}`);
  if (req.method === 'GET') {
    const { id } = req.query;
    console.log(`[API] Simulating demo preview for ID: ${id}`);

    // Simulate different demo previews based on ID
    if (id === '1') {
      // Redirect to a placeholder image for ID 1
      res.redirect(302, '/placeholder1.png');
    } else if (id === '2') {
      // Redirect to another placeholder image for ID 2
      res.redirect(302, '/placeholder2.jpg');
    } else {
      // Default to a generic placeholder if ID is not recognized
      res.redirect(302, '/placeholder1.png');
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    console.warn(`[API] Method ${req.method} not allowed for demo-preview.`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}