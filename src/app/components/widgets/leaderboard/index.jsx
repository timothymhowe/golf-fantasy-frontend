import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";

const Leaderboard = () => {
  const { user, auth } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (user) {
      user.getIdToken().then(token => {
        fetch("/api/league/scoreboard", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setLeaderboard(data.data.leaderboard);
            setIsLoaded(true);
          })
          .catch((error) => console.error(error));
      });
    }
    return () => {
      controller.abort();
    };
  }, [user]);

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
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.score}</td>
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
        <img
          src="/scoring.png"
          alt="Scoring"
          className="object-contain w-full h-full"
        />
      </div>
    </>
  );
};

export default Leaderboard;
