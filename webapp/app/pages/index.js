import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 text-white">Wallpaper Engine Web Exporter</h1>
      <div className="flex space-x-4">
        <Link href="/convert" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
          Convert Wallpaper
        </Link>
        <Link href="/demo" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
          View Demos
        </Link>
      </div>
    </div>
  );
}