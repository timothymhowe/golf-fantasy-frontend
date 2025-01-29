import React, { useEffect, useState } from "react";
import { useAuth } from "../../../auth-provider";
import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const LiveStats = ({ playerId, lastUpdated }) => {
  const [liveStats, setLiveStats] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/live_results/live', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const playerStats = data.live_stats.find(player => player.dg_id === playerId);
        setLiveStats(playerStats);
      } catch (error) {
        console.error("Error fetching live stats:", error);
      }
    };

    if (playerId && user && !liveStats) {
      fetchLiveStats();
    }
  }, [playerId, user, liveStats]);

  if (!liveStats) {
    return null;
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toFixed(2);
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return '-';
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDistance = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toFixed(1);
  };

  const getStatStyle = (value) => ({
    color: value > 0 ? '#BFFF00' : 'red',
  });

  const sgCategories = [
    { key: 'sg_ott', label: 'OTT', tooltip: 'Off the Tee' },
    { key: 'sg_t2g', label: 'T2G', tooltip: 'Tee to Green' },
    { key: 'sg_app', label: 'APP', tooltip: 'Approach' },
    { key: 'sg_arg', label: 'ARG', tooltip: 'Around the Green' },
    { key: 'sg_putt', label: 'PUTT', tooltip: 'Putting' },
    { key: 'sg_total', label: 'TOTAL', tooltip: 'Total' },
  ];

  // Format the last updated timestamp
  const formattedLastUpdated = lastUpdated ? format(utcToZonedTime(parseISO(lastUpdated), Intl.DateTimeFormat().resolvedOptions().timeZone), "PPpp") : "N/A";

  return (
    <div className="live-stats">
      <button onClick={() => setIsOpen(!isOpen)} className="toggle-button">
        {isOpen ? "Hide Live Stats" : "Show Live Stats"}
      </button>
      {isOpen && (
        <div className="stats-content overflow-auto">
          <table className="w-full table-fixed text-sm text-gray-500 font-medium text-left text-xs tracking-wide uppercase border-collapse">
            <thead>
              <tr className="bg-black/40 backdrop-blur border-b border-gray-500">
                <th className="px-2 py-2 border-r border-gray-500" colSpan={3}></th>
                <th className="px-2 py-2 border-r border-gray-500" colSpan={sgCategories.length} style={{ textAlign: 'center' }}>Strokes Gained</th>
                <th className="px-2 py-2 border-r border-gray-500" colSpan="2" style={{ textAlign: 'center' }}>Driving</th>
              </tr>
              <tr className="bg-black/40 backdrop-blur border-b border-gray-500 text-xs">
                <th className="px-2 py-1 border-r border-gray-500">Pos.</th>
                <th className="px-2 py-1 border-r border-gray-500">Score</th>
                <th className="px-2 py-1 border-r border-gray-500">Thru</th>
                {sgCategories.map((category) => (
                  <th key={category.key} className="px-2 py-1 border-r border-gray-500">
                    <span title={category.tooltip}>{category.label}</span>
                  </th>
                ))}
                <th className="px-2 py-1 border-r border-gray-500">Acc.</th>
                <th className="px-2 py-1">Dist.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="divide-y divide-white/10">
                <td className="px-2 py-2 border-r border-gray-500">{liveStats.position}</td>
                <td className="px-2 py-2 border-r border-gray-500" style={getStatStyle(liveStats.total)}>{Math.round(liveStats.total)}</td>
                <td className="px-2 py-2 border-r border-gray-500">{liveStats.thru}</td>
                {sgCategories.map((category) => (
                  <td key={category.key} className="px-2 py-2 border-r border-gray-500" style={getStatStyle(liveStats[category.key])}>
                    {formatNumber(liveStats[category.key])}
                  </td>
                ))}
                <td className="px-2 py-2 border-r border-gray-500" style={getStatStyle(liveStats.accuracy)}>{formatPercentage(liveStats.accuracy)}</td>
                <td className="px-2 py-2" style={getStatStyle(liveStats.distance)}>{formatDistance(liveStats.distance)}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-gray-400 text-xs mt-2">
            Last updated: {formattedLastUpdated}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStats;