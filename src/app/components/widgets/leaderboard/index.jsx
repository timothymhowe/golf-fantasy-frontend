import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";

import PickHistoryModal from '../../pick-history-modal';
import Image from "next/image";

// Avatar generation functions
const stringToColor = (str) => {
  // Darker versions of Google's color palette for better contrast with white text
  const colors = [
    '#1a73e8', // Darker Google Blue
    '#188038', // Darker Google Green
    '#b06000', // Darker Google Yellow
    '#c5221f', // Darker Google Red
    '#185abc', // Dark Blue
    '#137333', // Dark Green
    '#b06000', // Dark Yellow
    '#a50e0e', // Dark Red
    '#1a73e8', // Dark Blue
    '#188038', // Dark Green
    '#b06000', // Dark Yellow
    '#c5221f', // Dark Red
  ];
  
  // Generate a consistent index from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Function to get initials from a name
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Function to create an initials avatar
const createInitialsAvatar = (name, size) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fill background with the user's color
  ctx.fillStyle = stringToColor(name);
  ctx.fillRect(0, 0, size, size);
  
  // Add initials with Google's style
  ctx.fillStyle = 'white';
  ctx.font = `400 ${size * 0.5}px 'Roboto', 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(name), size / 2, size / 2);
  
  return canvas.toDataURL();
};

// TODO: Enhance leaderboard by making the current user's row sticky at the top
// This would involve:
// 1. Separating current user's row from other rows
// 2. Making it sticky below the header
// 3. Adding appropriate styling to highlight the user's row
// 4. Ensuring correct position numbers are maintained

const Leaderboard = () => {
  const { user, auth } = useAuth();
  const {selectedLeagueId} = useLeague();

  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {



    const controller = new AbortController();
    
    // Only proceed if user is fully initialized
    if (user?.getIdToken && selectedLeagueId) {  // Check if user has required methods
      user.getIdToken().then(token => {
        if (!controller.signal.aborted) {
          // Update fetch URL to include selectedLeagueId
          fetch(`/api/league/scoreboard/${selectedLeagueId}`, {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              if (!controller.signal.aborted && data.status === "success") {  // Add status check
                setLeaderboard(data.data.leaderboard);
                setIsLoaded(true);
              }
            })
            .catch((error) => {
              if (!controller.signal.aborted) {
                console.error(error);
              }
            });
        }
      });
    }

    return () => {
      controller.abort();
    };
  }, [user?.uid, selectedLeagueId]); // Only depend on user.uid instead of entire user object

  return (
    <>
      <div className="overflow-hidden w-full">
        <div className="max-h-[350px] overflow-y-auto overflow-x-hidden w-full">
          <table className="w-full text-sm text-left relative table-fixed">
            <thead>
              <tr className="sticky top-0 h-7 bg-black sm:bg-black/40 sm:backdrop-blur-sm text-white/50 uppercase z-10">
                <th className="w-[40px] pr-1 truncate text-center">
                  Rk.
                </th>
                <th className="w-[40%] pl-1 pr-3 truncate">
                  User
                </th>
                <th className="w-[20%] px-3 truncate text-center">
                  Points
                </th>
                <th className="w-[15%] px-3 truncate text-center">
                  Wins
                </th>
                <th className="w-[15%] px-3 truncate text-center">
                  No Pick
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-[Verdana] relative">
              {isLoaded ? (
                leaderboard.map((item, index) => (
                  <tr 
                    key={item.rank} 
                    className={`hover:bg-white/5 h-8 ${
                      index === 0 ? 'bg-yellow-500/5' :
                      index === 1 ? 'bg-slate-400/5' :
                      index === 2 ? 'bg-amber-700/5' : ''
                    }`}
                  >
                    <td className="pl-3 pr-1 py-1">
                      <span className={`
                        ${index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-slate-400' :
                          index === 2 ? 'text-amber-700' :
                          'text-white/50'}
                      `}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="pl-1 pr-3 py-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 relative flex-shrink-0 rounded ${
                          item.medalRank === 1 ? 'ring-2 ring-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]' :
                          item.medalRank === 2 ? 'ring-2 ring-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                          item.medalRank === 3 ? 'ring-2 ring-amber-700/50 shadow-[0_0_10px_rgba(180,83,9,0.3)]' : ''
                        }`}>
                          <Image
                            src={item.avatar_url || createInitialsAvatar(item.name, 32)}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded object-cover bg-black/20"
                            style={{ aspectRatio: '1/1' }}
                            onError={(e) => {
                              e.target.src = createInitialsAvatar(item.name, 32);
                            }}
                          />
                        </div>
                        <span 
                          className={`
                            ${item.medalRank === 1 ? 'text-yellow-500' :
                              item.medalRank === 2 ? 'text-slate-400' :
                              item.medalRank === 3 ? 'text-amber-700' :
                              'text-white/90'}
                            cursor-pointer hover:underline
                          `}
                          onClick={() => setSelectedMember({
                            leagueMemberId: item.leagueMemberId,
                            name: item.name
                          })}
                        >
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1 text-white/70 text-center">
                      {item.score > 0 ? '' : ''}{(item.score / 100).toFixed(1)}
                    </td>
                    <td className="px-3 py-1 text-white/70 text-center">
                      {item.wins || 0}
                    </td>
                    <td className="px-3 py-1 text-white/70 text-center">
                      {item.missedPicks}
                    </td>
                  </tr>
                ))
              ) : (
                [...Array(10)].map((_, index) => (
                  <tr key={index} className="animate-pulse h-8">
                    <td className="px-3">
                      <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    </td>
                    <td className="px-3">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    </td>
                    <td className="px-3">
                      <div className="h-4 bg-white/10 rounded w-2/4 mx-auto"></div>
                    </td>
                    <td className="px-3">
                      <div className="h-4 bg-white/10 rounded w-1/4 mx-auto"></div>
                    </td>
                    <td className="px-3">
                      <div className="h-4 bg-white/10 rounded w-1/4 mx-auto"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      
      <PickHistoryModal 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        memberId={selectedMember?.leagueMemberId}
        memberName={selectedMember?.name}
      />
    </>
  );
};

export default Leaderboard;
