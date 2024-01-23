"use client";

import React from "react";
import { useState } from "react";
// import { Button } from "flowbite-react";

import Sidebar from "../sidebar";

import "./header-styles.css";

const Header = ({isSidebarOpen, setIsSidebarOpen}) => {
  const toggleNav = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <header className="bg-green-800 text-white p-2 flex justify-between items-center">
      <div className="flex-grow">
        
        <button
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
        </button>
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
