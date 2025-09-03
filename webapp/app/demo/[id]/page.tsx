'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { demoWallpapers } from '../../../lib/demoData';

export default function DemoPage({ params }: any) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Find the demo wallpaper by ID
  const demoWallpaper = demoWallpapers.find(wallpaper => wallpaper.id === params.id) || {
    id: params.id,
    title: `Demo Wallpaper ${params.id}`,
    description: 'This is a demo wallpaper showcasing the capabilities of the Wallpaper Engine Web Exporter.',
    imageUrl: '/placeholder-image.jpg'
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Gallery
        </button>
        <h1 className="text-2xl font-bold">{demoWallpaper.title}</h1>
        <div></div> {/* Spacer for flex alignment */}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
        <div className="h-96 bg-gray-900 flex items-center justify-center relative">
          {/* Embed the converted wallpaper in an iframe */}
          <iframe
            src={`/demo/${params.id}/index.html`}
            className="w-full h-full"
            title={`${demoWallpaper.title} Wallpaper`}
            allowFullScreen
          />
          
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-lg transition-colors"
            title="Toggle fullscreen"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-300 mb-4">{demoWallpaper.description}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">ID</p>
                <p className="text-white font-mono">{demoWallpaper.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}