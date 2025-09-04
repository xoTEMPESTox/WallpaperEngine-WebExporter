import Link from 'next/link';

export default function DemoGallery() {
  const demoCards = [
    { id: '1', title: 'Abstract Waves', artist: 'John Doe', image: '/placeholder1.png' },
    { id: '2', title: 'Cyberpunk City', artist: 'Jane Smith', image: '/placeholder2.jpg' },
    { id: '3', title: 'Nature\'s Embrace', artist: 'Artist X', image: '/placeholder1.png' },
    { id: '4', title: 'Neon Dreams', artist: 'Artist Y', image: '/placeholder2.jpg' },
  ];

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Demo Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {demoCards.map((card) => (
          <div key={card.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <img src={card.image} alt={card.title} className="w-full h-48 object-cover"/>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-2">{card.title}</h2>
              <p className="text-gray-400 text-sm mb-4">By {card.artist}</p>
              <Link href={`/demo/${card.id}`} className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
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