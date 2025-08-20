import { ManualPickEntry } from './manual-pick-entry';
import React, { useRef, useState } from 'react';
import LeaguePicks from '../../../widgets/league-picks';
import Leaderboard from '../../../widgets/leaderboard';
import { FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatTournamentName } from '../../../../utils/formatTournamentName';

export const CommissionerView = () => {
  const leaguePicksRef = useRef(null);
  const leaderboardRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [tournamentName, setTournamentName] = useState('');

  const handleImageDownload = async (canvas, filename) => {
    try {
      // Check if running on mobile and if Web Share API is available
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && navigator.share) {
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], filename, { type: 'image/png' });
        
        // Share the image
        await navigator.share({
          files: [file],
          title: filename.replace('.png', ''),
        });
      } else {
        // Fallback to regular download for desktop
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Error handling image:', error);
      // Fallback to regular download if sharing fails
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const downloadPicksImage = async (e) => {
    if (e) e.preventDefault();
    
    setIsGeneratingImage(true);
    setErrorMessage(null);
    
    try {
      // Get the tournament name from the LeaguePicks component
      const tournamentName = leaguePicksRef.current?.getTournamentName();
      
      // Get the picks table element - updated selector to match the actual table
      const tableElement = document.querySelector('.league-picks table');
      if (!tableElement) {
        throw new Error('Could not find picks table element');
      }

      // Create a container for the image
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.backgroundColor = '#121212';
      container.style.padding = '16px';
      container.style.borderRadius = '12px';
      container.style.width = '500px'; // Fixed width for mobile-friendly view
      container.style.maxWidth = '100vw';

      // Add title for picks
      const titleDiv = document.createElement('div');
      titleDiv.style.marginBottom = '16px';
      titleDiv.style.color = 'white';
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.fontSize = '18px';
      titleDiv.style.textAlign = 'center';
      titleDiv.style.padding = '4px 8px';
      titleDiv.style.lineHeight = '1.4';
      
      // Format today's date and include tournament name if available
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const title = tournamentName 
        ? `Picks: ${formatTournamentName(tournamentName)}`
        : `League Picks - ${dateStr}`;
      titleDiv.textContent = title;
      container.appendChild(titleDiv);

      // Clone the table and its container
      const tableContainer = document.createElement('div');
      tableContainer.style.width = '100%';
      tableContainer.style.overflow = 'visible';

      // Create a new table structure
      const newTable = document.createElement('table');
      newTable.style.width = '100%';
      newTable.style.borderCollapse = 'collapse';
      newTable.style.backgroundColor = '#121212';
      newTable.style.color = 'white';
      newTable.style.fontSize = '14px';

      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.height = '36px';
      headerRow.style.backgroundColor = '#000000';
      headerRow.style.backdropFilter = 'blur(8px)';

      // Create two header cells for the two columns
      for (let i = 0; i < 2; i++) {
        const th = document.createElement('th');
        th.textContent = 'User';
        th.style.padding = '4px 8px';
        th.style.verticalAlign = 'middle';
        th.style.height = '36px';
        th.style.boxSizing = 'border-box';
        th.style.textAlign = 'left';
        th.style.width = '50%';
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      newTable.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');
      tbody.style.fontFamily = 'Verdana';

      // Get the original table data
      const originalTable = tableElement;
      const rows = originalTable.querySelectorAll('tbody tr');
      
      // Create a map of users to their picks
      const userPicks = new Map();
      rows.forEach(row => {
        const golferCell = row.cells[0];
        const usersCell = row.cells[1];
        const golferName = golferCell.textContent.trim().replace(/x\d+$/, '');
        
        // Get all user images from the cell
        const userImages = usersCell.querySelectorAll('img');
        userImages.forEach(img => {
          const userName = img.title;
          if (!userPicks.has(userName)) {
            userPicks.set(userName, {
              name: userName,
              avatar: img.src,
              golfer: golferName
            });
          }
        });
      });

      // Sort users alphabetically by name
      const sortedUsers = Array.from(userPicks.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      // Create rows with two columns
      for (let i = 0; i < sortedUsers.length; i += 2) {
        const tr = document.createElement('tr');
        tr.style.height = '24px';  // Increased from 20px to accommodate larger avatar
        tr.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';

        // Create cells for both columns
        for (let j = 0; j < 2; j++) {
          const td = document.createElement('td');
          td.style.padding = '2px 4px';
          td.style.verticalAlign = 'middle';
          td.style.width = '50%';
          td.style.borderRight = j === 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none';

          if (i + j < sortedUsers.length) {
            const user = sortedUsers[i + j];
            
            // Create user info container
            const userContainer = document.createElement('div');
            userContainer.style.display = 'inline-flex';
            userContainer.style.alignItems = 'center';
            userContainer.style.gap = '2px 4px';  // Increased gap for larger avatar

            // Create avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.style.width = '22px';  // Increased from 20px
            avatarDiv.style.height = '22px';  // Increased from 20px
            avatarDiv.style.position = 'relative';
            avatarDiv.style.flexShrink = '0';

            const avatarImg = document.createElement('img');
            avatarImg.src = user.avatar;
            avatarImg.alt = user.name;
            avatarImg.style.width = '22px';  // Increased from 20px
            avatarImg.style.height = '22px';  // Increased from 20px
            avatarImg.style.borderRadius = '4px';
            avatarImg.style.objectFit = 'cover';
            avatarDiv.appendChild(avatarImg);

            // Create user info
            const userInfo = document.createElement('div');
            userInfo.style.display = 'inline-block';  // Changed from inline-flex
            userInfo.style.verticalAlign = 'middle';  // Added vertical alignment
            userInfo.style.height = '24px';
            userInfo.style.marginTop = '-12px';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = user.name;
            nameSpan.style.color = 'rgba(255, 255, 255, 0.8)';
            nameSpan.style.fontSize = '13px';
            nameSpan.style.lineHeight = '1';
            nameSpan.style.padding = '0';
            nameSpan.style.margin = '0';
            nameSpan.style.display = 'block';  // Added to ensure block display

            const golferSpan = document.createElement('span');
            golferSpan.textContent = user.golfer;
            golferSpan.style.color = 'rgba(255, 255, 255, 0.6)';
            golferSpan.style.fontSize = '11px';
            golferSpan.style.lineHeight = '1';
            golferSpan.style.padding = '0';
            golferSpan.style.margin = '0';
            golferSpan.style.display = 'block';  // Added to ensure block display

            userInfo.appendChild(nameSpan);
            userInfo.appendChild(golferSpan);

            userContainer.appendChild(avatarDiv);
            userContainer.appendChild(userInfo);
            td.appendChild(userContainer);
          }

          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }

      newTable.appendChild(tbody);
      tableContainer.appendChild(newTable);
      container.appendChild(tableContainer);

      // Add to document temporarily
      document.body.appendChild(container);

      // Wait for any remaining rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      // Force a reflow
      container.offsetHeight;

      // Calculate the actual height needed
      const actualHeight = container.scrollHeight;

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the container
      const canvas = await html2canvas(container, {
        backgroundColor: '#121212',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 500,
        height: actualHeight,
        windowWidth: 500,
        windowHeight: actualHeight,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.height = 'auto';
            clonedContainer.style.overflow = 'visible';
          }
        }
      });
      
      // Remove the container
      document.body.removeChild(container);
      
      // Generate filename with tournament name if available
      const filename = tournamentName
        ? `${tournamentName.toLowerCase().replace(/\s+/g, '-')}-picks-${today.toISOString().split('T')[0]}.png`
        : `league-picks-${today.toISOString().split('T')[0]}.png`;
      
      await handleImageDownload(canvas, filename);
      
    } catch (error) {
      console.error('Error generating picks image:', error);
      setErrorMessage(error.message);
      alert('Failed to generate picks image: ' + error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadStandingsImage = async (e) => {
    if (e) e.preventDefault();
    
    setIsGeneratingImage(true);
    setErrorMessage(null);
    
    try {
      // Get the table element directly from the document
      const tableElement = document.querySelector('.leaderboard');
      if (!tableElement) {
        throw new Error('Could not find standings table element');
      }

      // Create a container for the image
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.backgroundColor = '#121212';
      container.style.padding = '16px';
      container.style.borderRadius = '12px';
      container.style.width = '500px'; // Fixed width for mobile-friendly view
      container.style.maxWidth = '100vw';

      // Add title for standings
      const titleDiv = document.createElement('div');
      titleDiv.style.marginBottom = '16px';
      titleDiv.style.color = 'white';
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.fontSize = '18px';
      titleDiv.style.textAlign = 'center';
      titleDiv.style.padding = '4px 8px';
      titleDiv.style.lineHeight = '1.4';
      
      // Format today's date as "Month Day, Year"
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      titleDiv.textContent = `League Standings - ${dateStr}`;
      container.appendChild(titleDiv);

      // Clone the table and its container
      const tableContainer = document.createElement('div');
      tableContainer.style.width = '100%';
      tableContainer.style.overflow = 'visible';

      const clone = tableElement.cloneNode(true);
      
      // Style the cloned table
      clone.style.width = '100%';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.fontSize = '14px';
      clone.style.backgroundColor = '#121212';
      clone.style.color = 'white';

      // Style the header row to ensure it's not cut off
      const headerRow = clone.querySelector('thead tr');
      if (headerRow) {
        headerRow.style.height = '36px';
        headerRow.style.backgroundColor = '#000000';
        headerRow.style.backdropFilter = 'blur(8px)';
      }

      // Style header cells
      const headerCells = clone.querySelectorAll('thead th');
      headerCells.forEach(cell => {
        cell.style.padding = '4px 8px';
        cell.style.verticalAlign = 'middle';
        cell.style.height = '36px';
        cell.style.boxSizing = 'border-box';
      });

      // Remove any scroll containers and ensure all rows are visible
      const scrollContainers = clone.querySelectorAll('[class*="overflow-y-auto"]');
      scrollContainers.forEach(container => {
        container.style.overflow = 'visible';
        container.style.maxHeight = 'none';
      });

      // Ensure all rows are visible
      const rows = clone.querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = 'table-row';
        row.style.visibility = 'visible';
        row.style.height = 'auto';
        row.style.verticalAlign = 'middle';
      });

      // Style all cells to ensure vertical centering
      const cells = clone.querySelectorAll('td');
      cells.forEach(cell => {
        // Reset any existing styles that might interfere
        cell.style.cssText = '';
        // Apply new styles
        cell.style.verticalAlign = 'middle';
        cell.style.padding = '4px 8px';
        cell.style.height = '28px';
        cell.style.boxSizing = 'border-box';
        cell.style.display = 'table-cell';
        cell.style.textAlign = 'center';
        
        // Find any text nodes and wrap them in spans
        Array.from(cell.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const span = document.createElement('span');
            span.style.cssText = `
              display: inline-block;
              vertical-align: middle;
              line-height: 28px;
            `;
            span.textContent = node.textContent;
            node.replaceWith(span);
          }
        });
      });

      // Fix images in the clone
      const nextImgElements = clone.querySelectorAll('img');
      nextImgElements.forEach(imgElement => {
        const parentDiv = imgElement.closest('div[class*="w-8 h-8"]');
        if (parentDiv) {
          // Reset parent div styles
          parentDiv.style.cssText = '';
          parentDiv.style.display = 'inline-flex';
          parentDiv.style.alignItems = 'center';
          parentDiv.style.justifyContent = 'center';
          parentDiv.style.verticalAlign = 'middle';
          parentDiv.style.height = '28px';
          
          const src = imgElement.getAttribute('src');
          const alt = imgElement.getAttribute('alt') || '';
          
          // Create a regular img element
          const regularImg = document.createElement('img');
          regularImg.width = 24;
          regularImg.height = 24;
          regularImg.className = 'rounded object-cover bg-black/20';
          regularImg.style.cssText = `
            width: 24px;
            height: 24px;
            aspect-ratio: 1/1;
            vertical-align: middle;
            display: inline-block;
          `;
          regularImg.title = alt;
          regularImg.alt = alt;
          
          // Handle image source
          if (src === '/portrait_placeholder_75.png') {
            regularImg.src = createInitialsAvatar(alt, 24);
          } else {
            regularImg.src = src.startsWith('/') 
              ? window.location.origin + src
              : src;
          }
          
          parentDiv.innerHTML = '';
          parentDiv.appendChild(regularImg);
        }
      });

      tableContainer.appendChild(clone);
      container.appendChild(tableContainer);

      // Add to document temporarily
      document.body.appendChild(container);

      // Wait for any remaining rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      // Force a reflow to ensure all content is properly laid out
      container.offsetHeight;

      // Calculate the actual height needed
      const actualHeight = container.scrollHeight;

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the container
      const canvas = await html2canvas(container, {
        backgroundColor: '#121212',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 500,
        height: actualHeight,
        windowWidth: 500,
        windowHeight: actualHeight,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.height = 'auto';
            clonedContainer.style.overflow = 'visible';
          }
        }
      });
      
      // Remove the container
      document.body.removeChild(container);
      
      // Replace the download code with the new handler
      await handleImageDownload(
        canvas,
        `league-standings-${today.toISOString().split('T')[0]}.png`
      );
      
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage(error.message);
      alert('Failed to generate image: ' + error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  return (
    <div className="commissioner-view">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">Commissioner Controls</h2>
        <ManualPickEntry />
        <div className="mt-4 flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={downloadPicksImage}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded transition-colors"
          >
            <FiDownload size={16} />
            <span>{isGeneratingImage ? 'Generating...' : 'Download Picks Image'}</span>
          </button>
          
          <button 
            type="button"
            onClick={downloadStandingsImage}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded transition-colors"
          >
            <FiDownload size={16} />
            <span>{isGeneratingImage ? 'Generating...' : 'Download Standings Image'}</span>
          </button>
        </div>
        
        {/* Error display */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
      </div>
      
      {/* Components section - always hidden */}
      <div className="components-section space-y-4 hidden">
        {/* Add the LeaguePicks component with the ref */}
        <div className="picks-section bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 text-white">League Picks</h3>
          <LeaguePicks 
            ref={leaguePicksRef} 
            setTitle={(title) => {
              // Extract tournament name from the title if it's a string
              if (typeof title === 'string') {
                setTournamentName(title);
              } else if (title?.props?.children?.[0]?.props?.children) {
                setTournamentName(title.props.children[0].props.children);
              }
            }} 
          />
        </div>

        {/* Add the Leaderboard component */}
        <div className="standings-section bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 text-white">League Standings</h3>
          <div className="leaderboard">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};