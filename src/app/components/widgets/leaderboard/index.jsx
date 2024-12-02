import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";
import PickHistoryModal from '../../pick-history-modal';
import Image from "next/image";

const Leaderboard = () => {
  const { user, auth } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    // Only proceed if user is fully initialized
    if (user?.getIdToken) {  // Check if user has required methods
      user.getIdToken().then(token => {
        // Only make the fetch if we haven't been aborted
        if (!controller.signal.aborted) {
          fetch("/api/league/scoreboard", {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              if (!controller.signal.aborted) {  // Check again before setting state
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
  }, [user?.uid]); // Only depend on user.uid instead of entire user object

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden pb-2">
        <div className="max-h-[350px] overflow-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-gray-50 border-b sticky top-0 h-7">
                <th className="w-10 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="w-[40%] px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="w-[20%] px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="w-[15%] px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                <th className="w-[15%] px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Missed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {isLoaded ? (
              leaderboard.map((item, index) => (
                <tr
                  key={item.rank}
                  className="hover:bg-gray-50 transition-colors duration-200 h-8"
                >
                  <td className="px-3 whitespace-nowrap font-medium text-gray-500">
                    {index === leaderboard.length - 1 ? '🤡' : item.rank}
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedMember(item)}
                      className="hover:text-blue-600 font-medium text-left w-full"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="px-3 whitespace-nowrap text-center font-mono">
                    {item.score > 0 ? '+' : ''}{(item.score / 100).toFixed(1)}
                  </td>
                  <td className="px-3 whitespace-nowrap text-center text-gray-500">
                    {item.wins || 0}
                  </td>
                  <td className="px-3 whitespace-nowrap text-center text-gray-500">
                    {item.missedPicks}
                  </td>
                </tr>
              ))
            ) : (
              // Update skeleton loading to match new column count
              [...Array(10)].map((_, index) => (
                <tr key={index} className="animate-pulse h-8">
                  <td className="px-3">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </td>
                  <td className="px-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </td>
                  <td className="px-3">
                    <div className="h-4 bg-gray-300 rounded w-2/4 mx-auto"></div>
                  </td>
                  <td className="px-3">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  </td>
                  <td className="px-3">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="hidden md:block">
        <Image
          width={100}
          height={100}
          src="/scoring.png"
          alt="Scoring"
          className="object-contain w-full h-full"
        />
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
