import Link from 'next/link';
import { useState } from 'react';

export default function Convert() {
  const [workshopLink, setWorkshopLink] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for input...');
  const [simulationMessage, setSimulationMessage] = useState('');

  const handleFetchWorkshop = async () => {
    console.log('[UI] User clicked Fetch Workshop');
    setStatusMessage('Fetching workshop data...');
    setSimulationMessage(''); // Clear previous simulation message

    try {
      const response = await fetch('/api/fetch-workshop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workshopLink }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[UI] Fetched workshop metadata:', data);
        setStatusMessage(`Successfully fetched: ${data.title}`);
        setSimulationMessage('This is a simulated output — shader/particle fidelity will be improved in later releases.');
      } else {
        const errorData = await response.json();
        console.error('[UI] Fetch Workshop failed:', errorData.error);
        setStatusMessage(`Error: ${errorData.error}`);
        setSimulationMessage('');
      }
    } catch (error) {
      console.error('[UI] Network error during Fetch Workshop:', error);
      setStatusMessage('Network error during fetch.');
      setSimulationMessage('');
    }
  };

  const handleGenerateZip = async () => {
    console.log('[UI] User clicked Generate Website Zip');
    setStatusMessage('Generating website zip...');
    setSimulationMessage(''); // Clear previous simulation message

    try {
      const response = await fetch('/api/generate-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workshopLink }), // Or you could use an ID if available
      });

      if (response.ok) {
        // Since generate-zip returns a file, we'll simulate the download
        console.log('[UI] Simulated zip generation successful. Initiating download.');
        setStatusMessage('Simulated zip generated. Download initiated.');
        setSimulationMessage('This is a simulated output — shader/particle fidelity will be improved in later releases.');

        // In a real scenario, you'd handle the file download here.
        // For demonstration, we'll just log that it would be downloaded.
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = `wallpaper_export_${workshopLink.split('/').pop() || 'simulated'}.zip`;
        // document.body.appendChild(a);
        // a.click();
        // a.remove();
        // window.URL.revokeObjectURL(url);

      } else {
        const errorData = await response.json();
        console.error('[UI] Generate Zip failed:', errorData.error);
        setStatusMessage(`Error: ${errorData.error}`);
        setSimulationMessage('');
      }
    } catch (error) {
      console.error('[UI] Network error during Generate Zip:', error);
      setStatusMessage('Network error during zip generation.');
      setSimulationMessage('');
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Convert Wallpaper</h1>

      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <label htmlFor="workshop-link" className="block text-gray-300 text-sm font-bold mb-2">
            Steam Workshop Link or ID:
          </label>
          <input
            type="text"
            id="workshop-link"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
            placeholder="e.g., https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890"
            value={workshopLink}
            onChange={(e) => setWorkshopLink(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-gray-300 text-sm font-bold mb-2">
            Upload .zip or .pkg file:
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".zip,.pkg"
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
          />
        </div>

        <div className="flex justify-between mb-6">
          <button
            onClick={handleFetchWorkshop}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Fetch Workshop
          </button>
          <button
            onClick={handleGenerateZip}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Generate Website Zip
          </button>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p className="mb-2">Progress Indicator: [___________]</p>
          <p className="mb-2">Status: {statusMessage}</p>
          {simulationMessage && (
            <p className="text-sm text-yellow-400 mt-2">{simulationMessage}</p>
          )}
          <p className="text-sm">Hint: Check the developer console (F12) for more details during conversion.</p>
        </div>
      </div>

      <Link href="/" className="mt-8 text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out">
        Back to Home
      </Link>
    </div>
  );
}