'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

export default function Convert() {
  const [workshopLink, setWorkshopLink] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for input...');
  const [simulationMessage, setSimulationMessage] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = async (files) => {
    const file = files[0]; // Only process the first file for now
    if (!file) return;

    setUploadedFile(file);
    setStatusMessage(`Processing file: ${file.name}`);
    setSimulationMessage('');

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (['zip', 'mp4', 'webm'].includes(fileExtension)) {
      // For video or unpacked layers found (from .zip, .mp4, .webm)
      // Immediately trigger the serverless generate-zip API
      setStatusMessage('Uploading and converting file...');
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/generate-zip', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('[UI] File conversion successful.');
          setStatusMessage('File converted. Download initiated.');
          // In a real scenario, you'd handle the file download here.
          // const blob = await response.blob();
          // const url = window.URL.createObjectURL(blob);
          // const a = document.createElement('a');
          // a.href = url;
          // a.download = `converted_${file.name}.zip`;
          // document.body.appendChild(a);
          // a.click();
          // a.remove();
          // window.URL.revokeObjectURL(url);
          setSimulationMessage('This is a simulated output — shader/particle fidelity will be improved in later releases. The converted file would typically download automatically.');
        } else {
          const errorData = await response.json();
          console.error('[UI] Generate Zip from file failed:', errorData.error);
          setStatusMessage(`Error converting file: ${errorData.error}`);
          setSimulationMessage('');
        }
      } catch (error) {
        console.error('[UI] Network error during file conversion:', error);
        setStatusMessage('Network error during file conversion.');
        setSimulationMessage('');
      }
    } else if (fileExtension === 'pkg') {
      setStatusMessage('scene.pkg files are not supported for direct upload.');
      setSimulationMessage('Please use the local CLI for .pkg files, or use the Steam Workshop downloader if available.');
    } else {
      setStatusMessage('Unsupported file type.');
      setSimulationMessage('Please upload .zip, .mp4, .webm, or scene.pkg files.');
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
            Upload Files:
          </label>
          <div
            id="dropzone"
            className={`flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 bg-gray-700'} transition-all duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('hidden-file-input').click()}
          >
            <p className="text-gray-400">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
              <br />
              <span className="text-xs">(Accepted: .zip, .mp4, .webm, scene.pkg)</span>
            </p>
            <input
              id="hidden-file-input"
              type="file"
              multiple
              accept=".zip,.mp4,.webm,.pkg"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <div className="flex justify-between mb-6">
          {process.env.NEXT_PUBLIC_ENABLE_DOWNLOADER === 'true' ? (
            <button
              onClick={handleFetchWorkshop}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
            >
              Fetch Workshop
            </button>
          ) : (
            <div className="text-gray-400 text-sm">
              To fetch from Steam Workshop, enable the downloader module.
              <a href="/docs/downloader-setup" className="text-blue-400 hover:text-blue-300"> See docs.</a>
            </div>
          )}
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