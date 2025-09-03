import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameter
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    // Validate URL parameter
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing URL parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that the URL is from Steam
    if (!targetUrl.startsWith('https://steamcommunity.com/') && 
        !targetUrl.startsWith('https://steamusercontent-a.akamaihd.net/') &&
        !targetUrl.startsWith('https://steamcdn-a.akamaihd.net/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL. Only Steam URLs are allowed.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the file from Steam
    const response = await fetch(targetUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch file from Steam. Status: ${response.status}`,
          status: response.status
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Create a new response with the same body and headers
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3153600, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Steam proxy error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}