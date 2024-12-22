"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLeague } from '../../league-context';
import { motion, AnimatePresence } from 'framer-motion';

const LeagueSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { leagues, selectedLeagueId, setSelectedLeagueId } = useLeague();
  const dropdownRef = useRef(null);

  const selectedLeague = leagues?.find(league => league.league_id === selectedLeagueId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!leagues || leagues.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-1.5 text-gray-300 hover:text-white transition-colors"
      >
        <span className="text-md">
          {selectedLeague?.league_name || 'Select League'}
        </span>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-1 w-48 rounded-lg bg-black/90 backdrop-blur-sm shadow-lg ring-1 ring-white/10"
          >
            <div className="py-1" role="menu">
              {leagues.map((league, index) => (
                <motion.button
                  key={league.league_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setSelectedLeagueId(league.league_id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors
                    ${selectedLeagueId === league.league_id
                      ? 'text-[#BFFF00] bg-white/5'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{league.league_name}</span>
                    {league.is_active && (
                      <span className="text-xs text-grey-500 italic">
                        Active
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeagueSelector;