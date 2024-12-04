import { useState, useEffect } from 'react';
import { useAuth } from '../../auth-provider';
// import { Tab } from "@headlessui/react";
import PickHistoryTable from '../../../components/pick-history-modal/pick-history-table';

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
      <PickHistoryTable 
        picks={picks.picks} 
        isLoading={isLoading} 
      />

      <div className="mt-4 text-sm text-gray-600 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-gray-600">Wins</div>
          <div>{picks.summary.wins}</div>
        </div>
        <div>
          <div className="text-gray-600">Duplicates</div>
          <div>{picks.summary.duplicate_picks}</div>
        </div>
        <div>
          <div className="text-gray-600">No Picks</div>
          <div>{picks.summary.missed_picks}</div>
        </div>
        <div>
          <div className="text-gray-600">Total Points</div>
          <div className="font-mono">
            {picks.summary.total_points >= 0 ? '+' : ''}
            {picks.summary.total_points}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickHistory;