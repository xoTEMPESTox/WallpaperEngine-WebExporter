'use client';

import { useState } from 'react';
import UploadBox from '../../components/UploadBox';
import { convertSteamWallpaper, downloadWallpaper } from '../../lib/converter';

export default function Convert() {
  const [steamLink, setSteamLink] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [conversionError, setConversionError] = useState('');

  const handleConvert = async () => {
    if (!steamLink.trim()) {
      setConversionError('Please enter a Steam Workshop link or ID');
      return;
    }
    
    setIsConverting(true);
    setConversionError('');
    setConversionProgress('Starting conversion...');
    
    try {
      // Perform the conversion
      const zipBlob = await convertSteamWallpaper(steamLink);
      
      // Download the result
      setConversionProgress('Downloading result...');
      downloadWallpaper(zipBlob, 'wallpaper-export');
      
      setConversionProgress('Conversion completed successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionError(error instanceof Error ? error.message : 'An unknown error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Convert Wallpaper</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <UploadBox />
        <div className="mt-8">
          <label htmlFor="steam-link" className="block text-sm font-medium text-gray-300 mb-2">
            Or enter Steam Workshop link/ID
          </label>
          <input
            type="text"
            id="steam-link"
            value={steamLink}
            onChange={(e) => setSteamLink(e.target.value)}
            placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=123456789 or 123456789"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>
        
        {/* Progress and error display */}
        {conversionProgress && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-blue-300">{conversionProgress}</p>
          </div>
        )}
        
        {conversionError && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300">Error: {conversionError}</p>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className={`px-8 py-3 font-medium rounded-lg transition-colors duration-200 ${
              isConverting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/20'
            }`}
          >
            {isConverting ? 'Converting...' : 'Convert'}
          </button>
        </div>
      </div>
    </div>
  );
}