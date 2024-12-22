import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth-provider';
import { useLeague } from '../../league-context';
import Image from 'next/image';
import { formatTournamentName } from '../../../utils/formatTournamentName';

const LeaguePicks = ({setTitle}) => {
  const { user } = useAuth();
  const { selectedLeagueId } = useLeague();
  const [picksData, setPicksData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle("Picks");
    setPicksData(null);
    setIsLoading(true);
    setError(null);
  }, [selectedLeagueId, setTitle]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPicks = async () => {
      if (!user || !selectedLeagueId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/league_picks/${selectedLeagueId}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setPicksData(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch picks');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching picks:', error);
          setError('Failed to load league picks');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPicks();

    return () => controller.abort();
  }, [user, selectedLeagueId]);

  useEffect(() => {
    if (picksData?.tournament) {
      setTitle(
        <div className="flex flex-col w-fit">
          <div className="flex items-center">
            <span className="text-white/60 mr-2">Picks:</span>
            <span className="text-gray-200 font-bold">
              {formatTournamentName(picksData.tournament.name)}
            </span>
          </div>
        </div>
      );
    }
  }, [picksData, setTitle]);

  if (isLoading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !picksData || !picksData.picks?.length) {
    return (
      <div className="p-4 text-center text-white/50">
        <p>Check back after picks lock for the week!</p>
      </div>
    );
  }

  return (
    <div className="league-picks">
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full divide-y divide-white/10">
          <thead>
            <tr className="sticky top-0 h-7 bg-black/40 backdrop-blur-sm  text-xs text-white/50 uppercase tracking-wider">
              <th className="px-2 py-1 text-left w-[35%]">Player</th>
              <th className="px-2 py-1 text-left w-[35%]">Pick</th>
              <th className="hidden sm:table-cell px-2 py-1 text-center w-[10%]">Pos</th>
              <th className="hidden sm:table-cell px-2 py-1 text-right w-[10%]">Score</th>
              <th className="px-2 py-1 text-right w-[10%]">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {picksData.picks.map((pick) => (
              <tr key={pick.member.id} className="hover:bg-white/5 h-8">
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Image
                      src={pick.member.avatar_url || "/portrait_placeholder_75.png"}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-white/90 truncate">
                      {pick.member.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  {pick.pick ? (
                    <span className="text-sm text-white/80 truncate">
                      {pick.pick.golfer_first_name} {pick.pick.golfer_last_name}
                    </span>
                  ) : (
                    <span className="text-sm text-red-400 italic">No Pick</span>
                  )}
                </td>
                <td className="hidden sm:table-cell px-2 py-1 text-center whitespace-nowrap">
                  <span className="text-sm text-white/70">
                    {pick.pick?.position || '-'}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-2 py-1 text-right whitespace-nowrap">
                  <span className="text-sm text-white/70">
                    {pick.pick?.score_to_par != null 
                      ? (pick.pick.score_to_par > 0 ? '+' : '') + pick.pick.score_to_par
                      : '-'}
                  </span>
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-white/90">
                    {pick.pick?.points != null ? pick.pick.points : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaguePicks;
