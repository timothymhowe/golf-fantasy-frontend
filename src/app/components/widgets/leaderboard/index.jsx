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
      <div className="max-h-[500px] w-[100%] overflow-auto">
        <table className="w-full table-auto text-sm divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Score</th>
              <th className="px-4 py-2 text-left">No Pick</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
          {isLoaded ? (
            leaderboard.map((item) => (
              <tr
                key={item.rank}
                className="hover:bg-gray-200 transition-colors duration-200"
              >
                <td className="px-4 py-2">{item.rank}</td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => {
                      console.log('Clicked member:', item);  // Debug log
                      setSelectedMember(item);
                    }}
                    className="hover:text-blue-600 hover:underline text-left w-full"
                  >
                    {item.name}
                  </button>
                </td>
                {/* Display score as float, rather than big ass int. */}
                <td className="px-4 py-2">{item.score / 100}</td> 
                <td className="px-4 py-2">{item.missedPicks}</td>
              </tr>
            ))
          ) : (
            // Skeleton screen
            [...Array(10)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-4 py-2">
                  <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-5 bg-gray-300 rounded w-2/4"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
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
        memberId={selectedMember?.id}
        memberName={selectedMember?.name}
      />
    </>
  );
};

export default Leaderboard;
