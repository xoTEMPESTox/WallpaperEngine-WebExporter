import Link from 'next/link';

interface DemoCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function DemoCard({ id, title, description, imageUrl }: DemoCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-primary-500 transition-colors duration-200">
      <div className="h-48 bg-gray-700 relative">
        {/* Placeholder for image */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          <span className="text-gray-500">Wallpaper Preview</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <Link
          href={`/demo/${id}`}
          className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Open Demo
        </Link>
      </div>
    </div>
  );
}