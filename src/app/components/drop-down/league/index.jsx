"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLeague } from '../../league-context';

const LeagueSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { leagues, selectedLeagueId, setSelectedLeagueId } = useLeague();
  const dropdownRef = useRef(null);

  const selectedLeague = leagues?.find(league => league.league_id === selectedLeagueId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!leagues || leagues.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-white hover:bg-green-700/50 rounded-lg transition-colors"
      >
        <span className="font-semibold text-sm">
          {selectedLeague?.league_name || 'Select League'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {leagues.map((league) => (
              <button
                key={league.league_id}
                onClick={() => {
                  setSelectedLeagueId(league.league_id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  selectedLeagueId === league.league_id
                    ? 'bg-green-50 text-green-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                <span className="block truncate">{league.league_name}</span>
                {league.is_active && (
                  <span className="text-xs text-green-600 ml-2">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueSelector;