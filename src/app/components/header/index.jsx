
"use client";

import React from "react";

import { useAuth } from "../auth-provider";

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
    <header className="bg-green-800 text-white p-2 flex justify-between items-center">
      <div className="flex-grow">
        
        {user && <button
          onClick={toggleNav}
          variant="icon"
          color="white"
          className="shadow-md rounded pancake-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 p-2"
        >
        
          {isSidebarOpen ? (
            <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
            >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
            </svg>
          ) : (
            <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
            >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
            </svg>
          )}
        </button>}
      </div>
      <a href="#home" className="text-2xl font-bold pr-[2em]">
        Golf '24
      </a>

      <div className="flex-grow">
        
      </div>
    </header>


  );
};

export default Header;
