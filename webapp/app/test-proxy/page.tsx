'use client';

import { useState } from 'react';

export default function TestProxy() {
  const [testUrl, setTestUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testProxy = async () => {
    if (!testUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the proxy directly
      const proxyUrl = `/api/steam-proxy?url=${encodeURIComponent(testUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: `Proxy test successful! Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`
        });
      } else {
        const errorText = await response.text();
        setTestResult({
          success: false,
          message: `Proxy test failed with status: ${response.status}. Error: ${errorText}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Proxy test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Steam Proxy</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="mb-6">
          <label htmlFor="test-url" className="block text-sm font-medium text-gray-300 mb-2">
            Enter a Steam URL to test
          </label>
          <input
            type="text"
            id="test-url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://steamcommunity.com/..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>
        
        <div className="flex justify-center mb-6">
          <button
            onClick={testProxy}
            disabled={isTesting}
            className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 ${
              isTesting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/20'
            }`}
          >
            {isTesting ? 'Testing...' : 'Test Proxy'}
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
            <li>Enter a valid Steam Workshop URL in the input field above</li>
            <li>Click "Test Proxy" to verify the proxy function works</li>
            <li>The result will show if the proxy successfully fetched the content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}