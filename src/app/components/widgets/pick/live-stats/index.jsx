import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../auth-provider';
import { calculatePoints } from '../../../../../utils/pointCalculator';

const LiveStats = ({ datagolfId, tournamentId, className, isWaiting }) => {
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  console.log('LiveStats mounted with:', { datagolfId, tournamentId });

  useEffect(() => {
    const fetchLiveStats = async () => {
      if (!user || !datagolfId || !tournamentId) {
        console.log('Missing required data:', { user: !!user, datagolfId, tournamentId });
        setIsLoading(false);
        setHasAttemptedFetch(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/live_results/big_fetch', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Full API response:', data);

        const golferStats = data.tournament_stats?.live_stats?.[datagolfId]?.info;
        if (golferStats) {
          console.log('Setting golfer stats:', golferStats);
          setLiveStats(golferStats);
        } else {
          console.log('No stats found for golfer:', datagolfId);
          setError('No stats available');
        }
      } catch (error) {
        console.error('Error fetching live stats:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      }
    };

    if (user) {
      fetchLiveStats();
      const pollInterval = setInterval(fetchLiveStats, 10 * 60 * 1000);
      return () => clearInterval(pollInterval);
    }
  }, [datagolfId, tournamentId, user]);

  if (!hasAttemptedFetch || isLoading) {
    return (
      <div className={`${className} animate-pulse bg-white/10 rounded px-3 py-1`}>
        <div className="h-4 w-16"></div>
      </div>
    );
  }

  if (error || !liveStats) {
    return null;
  }

  const getScoreDisplay = () => {
    if (isWaiting) {
      const points = calculatePoints(liveStats.position);
      return `${points}pts`;
    }
    const score = liveStats.total;
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return score.toString();
  };

  const getScoreClass = () => {
    if (isWaiting) {
      return 'bg-white/10 text-white/90';
    }
    const score = liveStats.total;
    if (score === 0) return 'bg-black text-white/90';
    if (score > 0) return 'bg-black text-white/90';
    return 'bg-red-600 text-white';
  };

  return (
    <div className={`${className} flex items-center gap-2 font-mono`}>
      <div className="bg-white/10 rounded px-2 py-1 text-sm text-white/90">
        {liveStats.position}
      </div>
      <div className={`${getScoreClass()} rounded px-2 py-1 text-sm min-w-[40px] text-center`}>
        {getScoreDisplay()}
      </div>
    </div>
  );
};

export default LiveStats; 