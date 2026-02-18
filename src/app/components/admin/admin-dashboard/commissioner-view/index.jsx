import { ManualPickEntry } from './manual-pick-entry';
import React, { useRef, useState } from 'react';
import LeaguePicks from '../../../widgets/league-picks';
import Leaderboard from '../../../widgets/leaderboard';
import { FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatTournamentName } from '../../../../utils/formatTournamentName';

// Avatar generation helpers (shared with leaderboard)
const stringToColor = (str) => {
  const colors = [
    '#1a73e8', '#188038', '#b06000', '#c5221f',
    '#185abc', '#137333', '#b06000', '#a50e0e',
    '#1a73e8', '#188038', '#b06000', '#c5221f',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

const createInitialsAvatar = (name, size) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = stringToColor(name);
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'white';
  ctx.font = `400 ${size * 0.5}px 'Roboto', 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(name), size / 2, size / 2);
  return canvas.toDataURL();
};

export const CommissionerView = () => {
  const leaguePicksRef = useRef(null);
  const leaderboardRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [tournamentName, setTournamentName] = useState('');

  // Stable callback to avoid re-renders in LeaguePicks when parent state changes
  const handleSetTitle = React.useCallback((title) => {
    if (typeof title === 'string') {
      setTournamentName(title);
    } else if (title?.props?.children?.[0]?.props?.children) {
      setTournamentName(title.props.children[0].props.children);
    }
  }, []);

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
      const tableElement = document.querySelector('.leaderboard table');
      if (!tableElement) {
        throw new Error('Could not find standings table element');
      }

      // Extract row data from the DOM
      const originalRows = tableElement.querySelectorAll('tbody tr');
      const standings = [];
      originalRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return;

        const rankEl = cells[0].querySelector('span');
        const rank = rankEl ? rankEl.textContent.trim() : '';

        const userCell = cells[1];
        const nameEl = userCell.querySelector('span');
        const name = nameEl ? nameEl.textContent.trim() : '';

        const imgEl = userCell.querySelector('img');
        let avatarSrc = null;
        if (imgEl) {
          const src = imgEl.getAttribute('src');
          if (src && src !== '/portrait_placeholder_75.png') {
            avatarSrc = src.startsWith('/') ? window.location.origin + src : src;
          }
        }

        const points = cells[2].textContent.trim();
        const wins = cells[3].textContent.trim();
        const noPick = cells[4].textContent.trim();

        // Detect medal rank from row classes
        const classList = row.className;
        let medalRank = 0;
        if (classList.includes('yellow-500')) medalRank = 1;
        else if (classList.includes('slate-400')) medalRank = 2;
        else if (classList.includes('amber-700')) medalRank = 3;

        standings.push({ rank, name, avatarSrc, points, wins, noPick, medalRank });
      });

      // Remove players with 0 or fewer points
      const filtered = standings.filter(s => parseFloat(s.points) > 0);
      // Use filtered list, but fall back to full list if everyone would be culled
      const displayStandings = filtered.length > 0 ? filtered : standings;

      if (displayStandings.length === 0) {
        throw new Error('No standings data found');
      }

      // Split into two columns (top half left, bottom half right)
      const midpoint = Math.ceil(displayStandings.length / 2);
      const leftCol = displayStandings.slice(0, midpoint);
      const rightCol = displayStandings.slice(midpoint);

      // Container width to fit two mini-tables
      const containerWidth = 750;

      // Create a container for the image
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute; left: -9999px;
        background-color: #121212; padding: 16px;
        border-radius: 12px; width: ${containerWidth}px;
        font-family: Verdana, sans-serif; color: white;
      `;

      // Add title
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `
        margin-bottom: 16px; color: white; font-weight: bold;
        font-size: 18px; text-align: center; padding: 4px 8px; line-height: 1.4;
      `;
      titleDiv.textContent = `League Standings - ${dateStr}`;
      container.appendChild(titleDiv);

      // Create the two-column flex container
      const columnsDiv = document.createElement('div');
      columnsDiv.style.cssText = 'display: flex; gap: 12px; width: 100%;';

      // Helper to build a mini-table for one column
      const buildMiniTable = (entries) => {
        const table = document.createElement('table');
        table.style.cssText = `
          width: 100%; border-collapse: collapse;
          background-color: #121212; color: white; font-size: 13px;
        `;

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.cssText = 'height: 32px; background-color: #000000;';

        const headers = [
          { text: 'Rk', width: '30px', align: 'center' },
          { text: 'User', width: 'auto', align: 'left' },
          { text: 'Pts', width: '50px', align: 'center' },
          { text: 'W', width: '30px', align: 'center' },
          { text: 'NP', width: '30px', align: 'center' },
        ];
        headers.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h.text;
          th.style.cssText = `
            padding: 4px 6px; vertical-align: middle; text-align: ${h.align};
            font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.5);
            ${h.width !== 'auto' ? `width: ${h.width};` : ''}
          `;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        const cellBase = 'padding: 4px 6px; vertical-align: middle; line-height: 22px; font-size: 13px; position: relative; top: -7px;';

        entries.forEach(entry => {
          const tr = document.createElement('tr');
          const rowBg = entry.medalRank === 1 ? 'background-color: rgba(234,179,8,0.05);' :
            entry.medalRank === 2 ? 'background-color: rgba(148,163,184,0.05);' :
            entry.medalRank === 3 ? 'background-color: rgba(180,83,9,0.05);' : '';
          tr.style.cssText = `border-bottom: 1px solid rgba(255,255,255,0.1); ${rowBg}`;

          // Medal color
          const medalColor = entry.medalRank === 1 ? '#eab308' :
            entry.medalRank === 2 ? '#94a3b8' :
            entry.medalRank === 3 ? '#b45309' : 'rgba(255,255,255,0.5)';
          const nameColor = entry.medalRank === 1 ? '#eab308' :
            entry.medalRank === 2 ? '#94a3b8' :
            entry.medalRank === 3 ? '#b45309' : 'rgba(255,255,255,0.9)';

          // Rank cell
          const rankTd = document.createElement('td');
          rankTd.style.cssText = `${cellBase} text-align: center; color: ${medalColor};`;
          rankTd.textContent = entry.rank;
          tr.appendChild(rankTd);

          // User cell (avatar + name) — use inline layout instead of flex for html2canvas compatibility
          const userTd = document.createElement('td');
          userTd.style.cssText = `${cellBase} text-align: left; white-space: nowrap;`;

          const avatar = document.createElement('img');
          avatar.width = 22;
          avatar.height = 22;
          avatar.style.cssText = 'width: 22px; height: 22px; min-width: 22px; border-radius: 4px; object-fit: cover; vertical-align: middle; margin-right: 6px; display: inline-block; position: relative; top: 7px;';
          avatar.src = entry.avatarSrc || createInitialsAvatar(entry.name, 22);
          avatar.alt = entry.name;

          const nameSpan = document.createElement('span');
          nameSpan.textContent = entry.name;
          nameSpan.style.cssText = `color: ${nameColor}; vertical-align: middle; display: inline;`;

          userTd.appendChild(avatar);
          userTd.appendChild(nameSpan);
          tr.appendChild(userTd);

          // Points cell
          const ptsTd = document.createElement('td');
          ptsTd.style.cssText = `${cellBase} text-align: center; color: rgba(255,255,255,0.7);`;
          ptsTd.textContent = entry.points;
          tr.appendChild(ptsTd);

          // Wins cell
          const winsTd = document.createElement('td');
          winsTd.style.cssText = `${cellBase} text-align: center; color: rgba(255,255,255,0.7);`;
          winsTd.textContent = entry.wins;
          tr.appendChild(winsTd);

          // No Pick cell
          const npTd = document.createElement('td');
          npTd.style.cssText = `${cellBase} text-align: center; color: rgba(255,255,255,0.7);`;
          npTd.textContent = entry.noPick;
          tr.appendChild(npTd);

          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;
      };

      // Build left and right columns
      const leftWrapper = document.createElement('div');
      leftWrapper.style.cssText = 'flex: 1; min-width: 0;';
      leftWrapper.appendChild(buildMiniTable(leftCol));

      const rightWrapper = document.createElement('div');
      rightWrapper.style.cssText = 'flex: 1; min-width: 0;';
      rightWrapper.appendChild(buildMiniTable(rightCol));

      columnsDiv.appendChild(leftWrapper);
      columnsDiv.appendChild(rightWrapper);
      container.appendChild(columnsDiv);

      // Add to document temporarily
      document.body.appendChild(container);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      container.offsetHeight;

      const actualHeight = container.scrollHeight;

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(container, {
        backgroundColor: '#121212',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: containerWidth,
        height: actualHeight,
        windowWidth: containerWidth,
        windowHeight: actualHeight,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.height = 'auto';
            clonedContainer.style.overflow = 'visible';
          }
        }
      });

      document.body.removeChild(container);

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
            setTitle={handleSetTitle}
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