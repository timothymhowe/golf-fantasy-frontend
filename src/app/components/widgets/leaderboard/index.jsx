import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";

// TODO: figure out why the auth request is being made twice.
const Leaderboard = () => {
  const auth = useAuth();
  const [authToken, setAuthToken] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {

    if (auth.currentUser) {
      auth.currentUser.getIdToken(true).then((idToken) => {
        setAuthToken(idToken);
      });
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (authToken) {
      fetch("/api/league/scoreboard", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setLeaderboard(data.data.leaderboard);
        })
        .catch((error) => console.error(error));
    }
  }, [authToken]);

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
            {leaderboard.map((item) => (
              <tr
                key={item.rank}
                className="hover:bg-gray-200 transition-colors duration-200"
              >
                <td className="px-4 py-2">{item.rank}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.score}</td>
                <td className="px-4 py-2">{item.missedPicks}</td>
              </tr>
            ))}
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
