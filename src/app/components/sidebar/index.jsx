'ren'
import react from "react";
import Avatar from "../avatar";

import { Link } from "next/link";

import "./sidebar-styles.css";

const Sidebar = ({ isOpen }) => {
  return (
    <nav
    className={`px-4 left-0 z-10 bg-white transform transition-transform duration-200 ease-in-out ${
      isOpen ? "translate-x-0 open" : "-translate-x-full"
    } sidebar absolute inset-x-s0 top-0 h-[100%]`}
    >

      
      <Avatar />

      <hr className="w-4/5 mx-auto border-gray-300 my-4" />

      <ul className="flex flex-col space-y-4 p-4 text-right">
        <li>
          <a href="/home" className="text-black hover:text-blue-500">
            Home
          </a>
        </li>
        <li>
          <a href="/about" className="text-black hover:text-blue-500">
            About
          </a>
        </li>
        <li>
          <a href="/contact" className="text-black hover:text-blue-500">
            Contact
          </a>
        </li>
        <li>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScqFE9p85yilbw00gtHi2-aKgXakE8GYg-W2borVuPaXvGapQ/viewform" className="text-black hover:text-blue-500">
            Legacy Google Form
          </a>
        </li>
      </ul>

      <div className="flex items-center justify-center mt-8">

      </div>
    </nav>
  );
};

export default Sidebar;
