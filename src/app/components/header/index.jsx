"use client";

import React from "react";
import { useAuth } from "../auth-provider";
import LeagueSelector from "../drop-down/league";

import "./header-styles.css";

/**
 * Header component for the application.
 *
 * @component
 * @param {boolean} isSidebarOpen - Indicates whether the sidebar is open or not.
 * @param {function} setIsSidebarOpen - Function to set the state of the sidebar.
 * @returns {JSX.Element} The rendered header component.
 */
const Header = ({isSidebarOpen, setIsSidebarOpen}) => {
  const user = useAuth();
  const toggleNav = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <header className="bg-gradient-to-b from-green-800 to-green-950 text-white p-2 flex justify-between items-center">
      <div className="flex-grow">
        {user && (
          <button
            onClick={toggleNav}
            variant="icon"
            color="white"
            className="shadow-md rounded pancake-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 p-2"
            aria-label="toggle navigation bar"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <a href="/dashboard" className="text-2xl font-bold pl-4 leading-none text-nowrap">
          pick.golf <span className="text-sm opacity-75">(beta)</span>
        </a>
        {user && <LeagueSelector />}
      </div>

      <div className="flex-grow"></div>
    </header>
  );
};

export default Header;
