"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth-provider';

const LeagueContext = createContext(null);

export const LeagueProvider = ({ children }) => {
  const { leagues } = useAuth();
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);

  // Only set initial league once when leagues are first loaded
  // Set initial league to first active league when leagues are loaded
  useEffect(() => {
    if (leagues?.length > 0 && !selectedLeagueId) {
      const activeLeague = leagues.find(league => league.is_active);
      if (activeLeague) {
        setSelectedLeagueId(activeLeague.league_id);
      } else {
        // Fallback to first league if no active leagues found
        setSelectedLeagueId(leagues[0].league_id);
      }
    }
  }, [leagues]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    leagues: leagues || [],
    selectedLeagueId,
    setSelectedLeagueId,
    selectedLeagueMemberId: leagues?.find?.(l => l.league_id === selectedLeagueId)?.league_member_id
  }), [leagues, selectedLeagueId]);

  return (
    <LeagueContext.Provider value={value}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};
