"use client";

import React from "react";
import { useAuth } from "../auth-provider";
import LeagueSelector from "../drop-down/league";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {Logo} from "../logo";

import "./header-styles.css";

/**
 * Header component for the application.
 *
 * @component
 * @param {boolean} isSidebarOpen - Indicates whether the sidebar is open or not.
 * @param {function} setIsSidebarOpen - Function to set the state of the sidebar.
 * @returns {JSX.Element} The rendered header component.
 */
const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Spacer div with margin for the floating header */}
      <div className="h-18 px-2 pb-2 pt-3 bg-[#2d2d2d] relative">
        <header 
          className="h-14 rounded-md relative mx-auto shadow-md"
          style={{
            background: 'linear-gradient(to bottom, #1a1a1a 0%, black 100%)'
          }}
        >
          {/* Gradient fade at bottom */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-black to-transparent" /> */}

          {/* Header content */}
          <div className="relative flex items-center h-full px-4 z-[100]">
            {/* Left: Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="pancake-button p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Center: League Selector */}
            <div className="flex-grow flex justify-center relative">
              {user && <LeagueSelector />}
            </div>

            {/* Right: Logo */}
            <div className="flex items-center">
              <Logo logoSize={40} className="hover:scale-105 transition-transform" />
            </div>
          </div>
        </header>
      </div>
    </>
  );
};

export default Header;


export const SkeletonHeader = () => {
  return (
    <div className="h-18 px-2 pb-2 pt-3 bg-[#2d2d2d] relative">
      <header 
        className="h-14 rounded-md relative mx-auto shadow-md"
        style={{
          background: 'linear-gradient(to bottom, #1a1a1a 0%, black 100%)'
        }}
      >
        {/* Header content */}
        <div className="relative flex items-center h-full px-4 z-[100]">
          {/* Left: Disabled Menu Button */}
          <div className="p-2 rounded-lg opacity-50">
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Center: League Selector Placeholder */}
          <div className="flex-grow flex justify-center relative">
            <div className="h-8 w-48 rounded-lg bg-white/5" />
          </div>

          {/* Right: Logo */}
          <div className="flex items-center">
            <Logo logoSize={40} />
          </div>
        </div>
      </header>
    </div>
  );
};