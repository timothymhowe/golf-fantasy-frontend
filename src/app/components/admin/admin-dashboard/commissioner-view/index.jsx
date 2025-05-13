import { ManualPickEntry } from './manual-pick-entry';
import React, { useRef, useState } from 'react';
import LeaguePicks from '../../../widgets/league-picks';
import { FiDownload } from 'react-icons/fi';

export const CommissionerView = () => {
  const leaguePicksRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const downloadPicksImage = async (e) => {
    if (e) e.preventDefault();
    
    setIsGeneratingImage(true);
    setErrorMessage(null);
    
    try {
      // Get the table element directly from the document
      const tableElement = document.querySelector('.league-picks');
      if (!tableElement) {
        throw new Error('Could not find picks table element');
      }

      console.log("Found table element:", tableElement);

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a clone of the table for better rendering
      const clone = tableElement.cloneNode(true);
      clone.style.maxHeight = 'none';  // Remove height restriction
      clone.style.overflow = 'visible';
      clone.style.backgroundColor = '#121212';
      clone.style.padding = '20px';
      clone.style.borderRadius = '8px';
      
      // Add to document temporarily
      document.body.appendChild(clone);
      
      // Wait a brief moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the clone
      console.log("Starting capture...");
      const canvas = await html2canvas(clone, {
        backgroundColor: '#121212',
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          console.log("Clone created:", clonedDoc);
        }
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.download = 'league-picks.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      console.log("Download triggered");
      
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage(error.message);
      alert('Failed to generate image: ' + error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Function to add a simple test to check if html2canvas works at all
  const testSimpleCapture = async () => {
    try {
      setIsGeneratingImage(true);
      
      // Dynamically import html2canvas to avoid issues
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a simple div
      const testDiv = document.createElement('div');
      testDiv.style.backgroundColor = '#121212';
      testDiv.style.padding = '20px';
      testDiv.style.color = 'white';
      testDiv.style.width = '200px';
      testDiv.style.height = '100px';
      testDiv.textContent = 'Test Image';
      
      document.body.appendChild(testDiv);
      
      // Try to capture it
      console.log("Attempting to capture test div...");
      const canvas = await html2canvas(testDiv, {
        backgroundColor: '#121212',
        scale: 1,
        logging: true
      });
      
      document.body.removeChild(testDiv);
      
      // Try to download
      const link = document.createElement('a');
      link.download = 'test-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      alert("Simple test capture successful!");
    } catch (err) {
      console.error('Test image error:', err);
      alert(`Simple test capture failed: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  return (
    <div className="commissioner-view">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">Commissioner Controls</h2>
        <ManualPickEntry />
      </div>
      
      <div className="admin-controls mb-6 mt-4">
        <h3 className="text-lg font-medium mb-3">Admin Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={downloadPicksImage}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded transition-colors"
          >
            <FiDownload size={16} />
            <span>{isGeneratingImage ? 'Generating...' : 'Download Picks Image'}</span>
          </button>
          
          {/* Test button for simple capture */}
          <button 
            onClick={testSimpleCapture}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            <span>Test Simple Capture</span>
          </button>
        </div>
        
        {/* Error display */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
      </div>
      
      {/* Add the LeaguePicks component with the ref */}
      <div className="picks-section bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3 text-white">League Picks</h3>
        <LeaguePicks ref={leaguePicksRef} setTitle={() => {}} />
      </div>
    </div>
  );
};