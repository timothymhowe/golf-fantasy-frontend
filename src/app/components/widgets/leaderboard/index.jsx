import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";

import PickHistoryModal from '../../pick-history-modal';
import Image from "next/image";

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
      <div className="overflow-hidden ">
        <div className="max-h-[350px] overflow-auto">
          <table className="w-full table-fixed text-sm text-gray-500 font-medium text-left text-xs tracking-wide uppercase">
            <thead>
              <tr className="sticky top-0 h-7 bg-black/40 backdrop-blur-sm text-white/50 uppercase">
                <th className="w-10 px-3">
                  Rk.
                </th>
                <th className="w-[40%] px-3">
                  Name
                </th>
                <th className="w-[20%] px-3 ">
                  Points
                </th>
                <th className="w-[15%] px-3 ">
                  Wins
                </th>
                <th className="w-[15%] px-3 ">
                  No Pick
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
            {isLoaded ? (
              leaderboard.map((item, index) => (
                <tr
                  key={item.rank}
                  className="hover:bg-white/5 transition-colors duration-200 h-8"
                >
                  <td className="px-3 whitespace-nowrap font-medium ">
                    {item.rank}
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedMember(item)}
                      className="hover:text-[#BFFF00] font-medium text-left w-full transition-colors"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="px-3 whitespace-nowrap text-center font-mono text-white/90">
                    {item.score > 0 ? '+' : ''}{(item.score / 100).toFixed(1)}
                  </td>
                  <td className="px-3 whitespace-nowrap text-center text-white/60">
                    {item.wins || 0}
                  </td>
                  <td className="px-3 whitespace-nowrap text-center text-white/60">
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
