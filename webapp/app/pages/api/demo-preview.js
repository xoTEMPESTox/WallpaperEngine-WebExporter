// webapp/app/pages/api/demo-preview.js

export default function handler(req, res) {
  console.log(`[API] Received request for demo-preview: ${req.method}`);
  if (req.method === 'GET') {
    const { id } = req.query;
    console.log(`[API] Simulating demo preview for ID: ${id}`);

    // Simulate different demo previews based on ID
    if (id === '1') {
      console.log(`[API] Redirecting demo-preview for ID: ${id} to /placeholder1.png`);
      res.redirect(302, '/placeholder1.png');
    } else if (id === '2') {
      console.log(`[API] Redirecting demo-preview for ID: ${id} to /placeholder2.jpg`);
      res.redirect(302, '/placeholder2.jpg');
    } else {
      console.warn(`[API] Unrecognized demo ID: ${id}. Redirecting to default /placeholder1.png`);
      res.redirect(302, '/placeholder1.png');
    }
    console.log(`[API] Demo preview request for ID: ${id} handled successfully.`);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    console.warn(`[API] Method ${req.method} not allowed for demo-preview.`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}