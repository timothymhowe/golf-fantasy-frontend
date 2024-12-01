import { useState, useEffect } from 'react';
import { useAuth } from '../../auth-provider';

const PickHistory = () => {
  const { user } = useAuth();
  const [picks, setPicks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPicks = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/user/history", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPicks(data);
        setError(null);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching pick history:", error);
          setError("Failed to load pick history");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPicks();
    }

    return () => controller.abort();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!picks || !picks.picks.length) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No pick history available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{picks.member.name}'s Picks</h3>
        <p className="text-sm text-gray-600">{picks.member.league}</p>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full table-auto text-sm divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Tournament</th>
              <th className="px-4 py-2 text-left">Golfer</th>
              <th className="px-4 py-2 text-right">Result</th>
              <th className="px-4 py-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {picks.picks.map((pick, index) => (
              <tr 
                key={index}
                className={`
                  hover:bg-gray-50 transition-colors duration-200
                  ${pick.pick_status.is_no_pick ? 'text-red-500' : ''}
                  ${pick.pick_status.is_duplicate_pick ? 'text-orange-500' : ''}
                `}
              >
                <td className="px-4 py-2">
                  <div>{pick.tournament.name}</div>
                  <div className="text-xs text-gray-500">{pick.tournament.date}</div>
                </td>
                <td className="px-4 py-2">{pick.golfer.name}</td>
                <td className="px-4 py-2 text-right">
                  {pick.result.status === 'cut' ? 'CUT' : 
                   pick.result.status === 'wd' ? 'WD' : 
                   pick.result.result || '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {pick.points >= 0 ? '+' : ''}{pick.points}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold border-t-2 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right">Total Points:</td>
              <td className="px-4 py-2 text-right font-mono">
                {picks.summary.total_points >= 0 ? '+' : ''}
                {picks.summary.total_points}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div>Total Picks: {picks.summary.total_picks}</div>
        <div>Majors Played: {picks.summary.majors_played}</div>
        <div>Missed Picks: {picks.summary.missed_picks}</div>
        <div>Duplicate Picks: {picks.summary.duplicate_picks}</div>
      </div>
    </div>
  );
};

export default PickHistory;