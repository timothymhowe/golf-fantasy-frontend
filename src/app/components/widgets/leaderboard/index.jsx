import React from "react";

const Leaderboard = () => {
  const placeholder_data = [
    { rank: 1, name: "John", score: 100, missedPicks: 2 },
    { rank: 2, name: "Jane", score: 90, missedPicks: 5 },
    { rank: 3, name: "Bob", score: 80, missedPicks: 3 },
    { rank: 4, name: "Alice", score: 75, missedPicks: 4 },
    { rank: 5, name: "Charlie", score: 70, missedPicks: 1 },
    { rank: 6, name: "David", score: 65, missedPicks: 2 },
    { rank: 7, name: "Eve", score: 60, missedPicks: 3 },
    { rank: 8, name: "Frank", score: 55, missedPicks: 4 },
    { rank: 9, name: "Grace", score: 50, missedPicks: 1 },
    { rank: 10, name: "Heidi", score: 45, missedPicks: 2 },
    // Add more data as needed
  ];

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
            {placeholder_data.map((item) => (
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
