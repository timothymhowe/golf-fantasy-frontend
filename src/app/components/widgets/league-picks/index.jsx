import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../../auth-provider';
import { useLeague } from '../../league-context';
import Image from 'next/image';
import { formatTournamentName } from '../../../utils/formatTournamentName';
import { LeaguePicksImageGenerator, generatePicksImage } from './image-generator';

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
  // Use a larger, thinner font size (Google uses Roboto)
  ctx.font = `400 ${size * 0.5}px 'Roboto', 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(name), size / 2, size / 2);
  
  return canvas.toDataURL();
};


const LeaguePicks = forwardRef(({setTitle, showDownloadButton = false}, ref) => {
  const { user } = useAuth();
  const { selectedLeagueId } = useLeague();
  const [picksData, setPicksData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const picksTableRef = useRef(null);

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    generateImage: async () => {
      try {
        console.log("generateImage called from ref");
        if (!picksData || !picksTableRef.current) {
          console.error("Missing picksData or tableRef:", { 
            hasPicksData: !!picksData, 
            hasTableRef: !!picksTableRef.current 
          });
          return false;
        }
        
        console.log("Using generatePicksImage utility...");
        try {
          const imageUrl = await generatePicksImage(picksData, picksTableRef);
          
          if (!imageUrl) {
            console.error("No image URL returned from generator");
            return false;
          }
          
          console.log("Image generated successfully, creating download...");
          // Create the download link
          const link = document.createElement('a');
          link.download = `${picksData.tournament.name.replace(/\s+/g, '-').toLowerCase()}-picks.png`;
          link.href = imageUrl;
          link.click();
          
          return true;
        } catch (generatorError) {
          console.error("Error in image generator:", generatorError);
          throw generatorError;
        }
      } catch (error) {
        console.error("Error in generateImage method:", error);
        throw error;
      }
    },
    hasPicksData: () => !!picksData && picksData.picks?.length > 0,
    getTournamentName: () => picksData?.tournament?.name
  }));

  useEffect(() => {
    setTitle("Picks");
    setPicksData(null);
    setIsLoading(true);
    setError(null);
  }, [selectedLeagueId, setTitle]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPicks = async () => {
      if (!user || !selectedLeagueId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/league_picks/${selectedLeagueId}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setPicksData(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch picks');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching picks:', error);
          setError('Failed to load league picks');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPicks();

    return () => controller.abort();
  }, [user, selectedLeagueId]);

  useEffect(() => {
    if (picksData?.tournament) {
      setTitle(
        <div className="flex flex-col w-fit">
          <div className="flex items-center">
            <span className="text-white/60 mr-2">Picks:</span>
            <span className="text-gray-200 font-bold">
              {formatTournamentName(picksData.tournament.name)}
            </span>
          </div>
        </div>
      );
    }
  }, [picksData, setTitle]);

  if (isLoading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !picksData || !picksData.picks?.length) {
    return (
      <div className="p-4 text-center text-white/50">
        <p>Check back after picks lock for the week!</p>
      </div>
    );
  }

  return (
    <div className="league-picks overflow-hidden">
      {showDownloadButton && picksData && picksData.picks?.length > 0 && (
        <LeaguePicksImageGenerator 
          picksData={picksData} 
          tableRef={picksTableRef} 
          showButton={true} 
        />
      )}
      <div ref={picksTableRef} className="max-h-[300px] overflow-y-auto overflow-x-hidden">
        <table className="w-full text-sm text-left relative">
          <thead>
            <tr className="sticky top-0 h-7 bg-black sm:bg-black/40 sm:backdrop-blur-sm text-white/50 uppercase z-10">
              <th className="px-2 py-1 text-left w-[35%]">Golfer</th>
              <th className="px-2 py-1 text-left w-[35%]">Picked By</th>
              <th className="hidden sm:table-cell px-2 py-1 text-center w-[10%]">Pos</th>
              <th className="hidden sm:table-cell px-2 py-1 text-right w-[10%]">Score</th>
              <th className="px-2 py-1 text-right w-[10%]">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 font-[Verdana] relative">
            {Object.values(
              picksData.picks.reduce((acc, pick) => {
                if (!pick.pick) return acc;
                
                const golferId = pick.pick.golfer_id;
                if (!acc[golferId]) {
                  acc[golferId] = {
                    golfer: pick.pick,
                    users: [],
                  };
                }
                acc[golferId].users.push(pick.member);
                return acc;
              }, {})
            )
            .sort((a, b) => {
              // First sort by number of picks (descending)
              const pickDiff = b.users.length - a.users.length;
              // If same number of picks, sort by points (descending)
              if (pickDiff === 0) {
                return (b.golfer.points || 0) - (a.golfer.points || 0);
              }
              return pickDiff;
            })
            .map(({ golfer, users }) => (
              <tr key={golfer.golfer_id} className="hover:bg-white/5 h-8">
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">
                      {golfer.golfer_first_name} {golfer.golfer_last_name}
                      {users.length > 1 && (
                        <span className="text-xs text-white/50 ml-1">
                          x{users.length}
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {users.map((user) => {
                      const avatarUrl = user.avatar_url || createInitialsAvatar(user.name, 75); // Slightly larger for better readability
                      return (
                        <div key={user.id} className="w-6 h-6 relative flex-shrink-0">
                          <Image
                            src={avatarUrl}
                            alt={user.name}
                            width={24}
                            height={24}
                            className="rounded object-cover bg-black/20"
                            style={{ aspectRatio: '1/1' }}
                            title={user.name}
                          />
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-2 py-1 text-center whitespace-nowrap">
                  <span className="text-sm text-white/70">
                    {golfer.position || '-'}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-2 py-1 text-right whitespace-nowrap">
                  <span className="text-sm text-white/70">
                    {golfer.score_to_par != null 
                      ? (golfer.score_to_par > 0 ? '+' : '') + golfer.score_to_par
                      : '-'}
                  </span>
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-white/90">
                    {golfer.points != null ? golfer.points : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

LeaguePicks.displayName = 'LeaguePicks';

export default LeaguePicks;
