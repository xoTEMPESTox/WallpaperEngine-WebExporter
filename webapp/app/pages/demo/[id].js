import { useRouter } from 'next/router';
import Link from 'next/link';
import path from 'path';
import fs from 'fs/promises';
import demoWallpapers from '../../../../docs/demo_wallpapers.json';

export default function DemoViewer({ wallpaper, outputWebPath }) {
  const router = useRouter();
  const { id } = router.query;

  if (!wallpaper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-4xl font-bold mb-8">Wallpaper Not Found</h1>
        <p className="text-lg mb-4">The demo wallpaper with ID "{id}" could not be found.</p>
        <Link href="/demo" className="mt-8 text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out">
          Back to Demo Gallery
        </Link>
      </div>
    );
  }

  // Function to extract artist name and Steam profile link from descriptionSnippet
  const extractArtistInfo = (description) => {
    let artistName = wallpaper.authorName || 'Unknown Artist'; // Fallback to authorName if provided, else 'Unknown Artist'
    let steamProfileLink = '';

    // Regex to find "Art by X" or "Artwork by X"
    const artistRegex = /(?:Art|Artwork) by\s*([^\n\r(]*?)(?:\s*\(?https?:\/\/(?:www\.)?steamcommunity\.com\/profiles\/[^\)]+\)?|\s*\[https?:\/\/(?:www\.)?steamcommunity\.com\/profiles\/[^\]]+\])?/i;
    // Regex to find Steam profile links
    const steamLinkRegex = /https?:\/\/(?:www\.)?steamcommunity\.com\/(?:profiles|id)\/[a-zA-Z0-9_-]+/i;

    const artistMatch = description.match(artistRegex);
    if (artistMatch && artistMatch[1]) {
      artistName = artistMatch[1].trim();
    }

    const steamLinkMatch = description.match(steamLinkRegex);
    if (steamLinkMatch) {
      steamProfileLink = steamLinkMatch[0];
    }

    return { artistName, steamProfileLink };
  };

  const { artistName, steamProfileLink } = extractArtistInfo(wallpaper.descriptionSnippet);
  const steamWorkshopUrl = `https://steamcommunity.com/sharedfiles/filedetails/?id=${wallpaper.id}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Demo Viewer: {wallpaper.title}</h1>

      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        {outputWebPath ? (
          <iframe
            src={outputWebPath}
            title={`Demo ${wallpaper.title}`}
            className="w-full h-[400px] border-none rounded-md mb-4"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-gray-300 mb-4">
            This is a placeholder for the embedded web project or preconverted output.
            (Not yet converted using the Python CLI)
          </p>
        )}
        
        <p className="text-gray-400 text-sm mb-2">
          Metadata: ID: {wallpaper.id}, Resolution: {wallpaper.resolution || 'N/A'}
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Artist: {artistName}
          {steamProfileLink && (
            <a
              href={steamProfileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out"
            >
              (Steam Profile)
            </a>
          )}
        </p>
        <a
          href={steamWorkshopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out"
        >
          Link to Original Steam Workshop Page
        </a>
      </div>

      <Link href="/demo" className="mt-8 text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out">
        Back to Demo Gallery
      </Link>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const wallpaper = demoWallpapers.find(wp => wp.id === id) || null;

  let outputWebPath = null;
  const debugJsonPath = path.join(process.cwd(), 'output', 'web', id, 'debug.json');

  try {
    const debugData = await fs.readFile(debugJsonPath, 'utf-8');
    const debugInfo = JSON.parse(debugData);
    if (debugInfo.results && debugInfo.results.length > 0 && debugInfo.results[0].status === 'success') {
      const relativePath = debugInfo.results[0].output_dir.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL
      // Adjust path for public directory serving
      outputWebPath = `/${relativePath.replace('output/', '')}/index.html`;
    }
  } catch (error) {
    console.error(`Could not read debug.json for demo ${id}:`, error.message);
  }

  return {
    props: {
      wallpaper,
      outputWebPath,
    },
  };
}