'use client';

import DemoCard from '../../components/DemoCard';
import { demoWallpapers } from '../../lib/demoData';

export default function DemoGallery() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Demo Wallpapers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoWallpapers.map((wallpaper) => (
          <DemoCard
            key={wallpaper.id}
            id={wallpaper.id}
            title={wallpaper.title}
            description={wallpaper.description}
            imageUrl={wallpaper.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}