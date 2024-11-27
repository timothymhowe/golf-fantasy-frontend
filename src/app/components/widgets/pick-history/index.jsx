import { useState, useEffect } from 'react';
import { useAuth } from '../../auth-provider';

const MyPicks = () => {
  const { user } = useAuth();
  const [picks, setPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    if (user) {
      user.getIdToken().then(token => {
        fetch("/api/user/history", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setPicks(data);
            setIsLoading(false);
          })
          .catch((error) => {
            if (!controller.signal.aborted) {
              console.error("Error fetching pick history:", error);
              setIsLoading(false);
            }
          });
      });
    }

    return () => controller.abort();
  }, [user]);

  return (
    <div className="w-full">
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full table-auto text-sm divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Week</th>
                <th className="px-4 py-2 text-left">Tournament</th>
                <th className="px-4 py-2 text-left">Golfer</th>
                <th className="px-4 py-2 text-right">Position</th>
                <th className="px-4 py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {picks.map((pick, index) => (
                <tr 
                  key={index}
                  className={`
                    hover:bg-gray-200 transition-colors duration-200
                    ${pick.status === 'cut' ? 'text-red-500' : ''}
                    ${pick.status === 'wd' ? 'text-orange-500' : ''}
                  `}
                >
                  <td className="px-4 py-2">{pick.weekNumber}</td>
                  <td className="px-4 py-2">{pick.tournamentName}</td>
                  <td className="px-4 py-2">{pick.golferName}</td>
                  <td className="px-4 py-2 text-right">{pick.position}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {pick.points >= 0 ? '+' : ''}{pick.points}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold border-t-2">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right">Total Points:</td>
                <td className="px-4 py-2 text-right font-mono">
                  {picks.reduce((sum, pick) => sum + pick.points, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyPicks;