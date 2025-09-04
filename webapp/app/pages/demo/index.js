import Link from 'next/link';
import demoWallpapers from '../../../../docs/demo_wallpapers.json';

export default function DemoGallery() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Demo Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {demoWallpapers.map((wallpaper) => (
          <div key={wallpaper.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src={wallpaper.previewImageURL || '/placeholder1.png'} // Fallback to placeholder if no image
              alt={wallpaper.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-2">{wallpaper.title}</h2>
              <p className="text-gray-400 text-sm mb-4">By {wallpaper.authorName || 'Unknown Artist'}</p>
              <Link href={`/demo/${wallpaper.id}`} className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                Open Demo
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out">
          Back to Home
        </Link>
      </div>
    </div>
  );
}