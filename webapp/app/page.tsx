import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
        Wallpaper Engine Web Exporter
      </h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">
        Convert your favorite Steam Workshop wallpapers to web format and showcase them in your browser.
        Bring your dynamic wallpapers to the web with ease.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/convert"
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-primary-500/20"
        >
          Convert from Steam
        </Link>
        <Link
          href="/demo"
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
        >
          See Demos
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-2 text-primary-400">Easy Conversion</h3>
          <p className="text-gray-400">
            Convert Steam Workshop wallpapers to web format with a single click.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-2 text-primary-400">Web Friendly</h3>
          <p className="text-gray-400">
            Optimized for web browsers with reduced file sizes and improved performance.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-2 text-primary-400">Showcase</h3>
          <p className="text-gray-400">
            Display your wallpapers in a beautiful gallery with sharing capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}