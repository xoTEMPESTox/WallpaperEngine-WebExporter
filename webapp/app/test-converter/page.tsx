'use client';

import { useState } from 'react';
import { convertSteamWallpaper } from '../../lib/converter';

export default function TestConverter() {
  const [steamLink, setSteamLink] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testConverter = async () => {
    if (!steamLink.trim()) {
      setTestResult({ success: false, message: 'Please enter a Steam Workshop link or ID' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the converter with proxy fallback
      console.log('Testing converter with proxy fallback...');
      const result = await convertSteamWallpaper(steamLink);
      
      setTestResult({
        success: true,
        message: `Converter test successful! Result size: ${result.size} bytes`
      });
    } catch (error) {
      console.error('Converter test error:', error);
      setTestResult({
        success: false,
        message: `Converter test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Converter with Proxy Fallback</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="mb-6">
          <label htmlFor="steam-link" className="block text-sm font-medium text-gray-300 mb-2">
            Enter a Steam Workshop link or ID
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
        
        <div className="flex justify-center mb-6">
          <button
            onClick={testConverter}
            disabled={isTesting}
            className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 ${
              isTesting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/20'
            }`}
          >
            {isTesting ? 'Testing...' : 'Test Converter'}
          </button>
        </div>
        
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-900/30 border-green-700 text-green-300' 
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            <p>{testResult.message}</p>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border-gray-700">
          <h2 className="text-lg font-semibold mb-2">How to test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Enter a valid Steam Workshop URL or ID in the input field above</li>
            <li>Click "Test Converter" to verify the converter works with proxy fallback</li>
            <li>The converter will first try a direct fetch, then fallback to the proxy if needed</li>
            <li>The result will show if the conversion was successful</li>
          </ol>
        </div>
      </div>
    </div>
  );
}