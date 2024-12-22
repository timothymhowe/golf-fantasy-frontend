import { useState, useEffect } from 'react';
import { useAuth } from '../../auth-provider';
import { useLeague } from '../../league-context';
// import { Tab } from "@headlessui/react";
import PickHistoryTable from '../../../components/pick-history-modal/pick-history-table';

const PickHistory = () => {
  const { user } = useAuth();
  const [picks, setPicks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {selectedLeagueId} = useLeague();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPicks = async () => {
      try {
        const token = await user.getIdToken();
        if (token && selectedLeagueId) {
        const response = await fetch(`/api/user/history/${selectedLeagueId}`, {
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
      }
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
  }, [user, selectedLeagueId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-6 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!picks || !picks.picks.length) {
    return (
      <div className="text-gray-400 p-4 text-center">
        No pick history available
      </div>
    );
  }

  // ... imports and other code remain the same ...

return (
  <div className="w-full">
    <PickHistoryTable 
      picks={picks.picks} 
      isLoading={isLoading} 
    />

    {/* Separator line */}
    <div className="w-full h-px bg-white/10 mb-2" />

    {/* Stats footer with improved centering */}
    <div className="text-sm flex flex-row gap-6 text-center pb-2 px-2 items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="text-gray-400">Wins</div>
        <div className="text-gray-200">{picks.summary.wins}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400">Duplicates</div>
        <div className="text-gray-200">{picks.summary.duplicate_picks}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400">No Picks</div>
        <div className="text-gray-200">{picks.summary.missed_picks}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400">Total Points</div>
        <div className="font-mono text-gray-200">
          {picks.summary.total_points >= 0 ? '+' : ''}
          {picks.summary.total_points}
        </div>
      </div>
    </div>
  </div>
);
};

export default PickHistory;