import React from "react";
import Avatar from "../avatar";
import { useAuth } from "../auth-provider";
import "./sidebar-styles.css";
import LogoutButton from "../logout-button";

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  console.log('Auth user data:', user);

  return (
    <nav
      className={`px-4 left-0 z-10 bg-white transform transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0 open" : "-translate-x-full"
      } sidebar absolute inset-x-s0 top-0 h-[100%]`}
    >
      <Avatar 
        avatarUrl={user?.photoURL}
        displayName={user?.displayName}
      />
      <div className="text-center text-gray-700">
        {user?.displayName || user?.email || 'Loading...'}
      </div>

      <hr className="w-4/5 mx-auto border-gray-300 my-4" />

      <ul className="flex flex-col space-y-4 p-4 text-right">
        <li>
          <a href="/dashboard" className="text-black hover:text-blue-500">
            Home
          </a>
        </li>
        <li>
          <a href="/settings/profile" className="text-black hover:text-blue-500">
            Profile
          </a>
        </li>
        <li>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScqFE9p85yilbw00gtHi2-aKgXakE8GYg-W2borVuPaXvGapQ/viewform"
            className="text-black hover:text-blue-500"
          >
            Legacy Google Form
          </a>
        </li>
        <li>
          <a className="text-black hover:text-blue-500"> Something Cool (coming soon) </a>
          </li>
        <li>

        
          <LogoutButton />
        </li>
      </ul>

      <div className="flex items-center justify-center mt-8"></div>
    </nav>
  );
};

export default Sidebar;
