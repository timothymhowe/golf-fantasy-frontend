'ren'
import react from "react";
import Avatar from "../avatar";

import "./sidebar-styles.css";

const Sidebar = ({ isOpen }) => {
  return (
    <nav
    className={`px-4 z-10 bg-white transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
      isOpen ? "translate-x-0 open" : "-translate-x-full"
    } sidebar absolute inset-x-s0 top-0 h-[100%]`}
    >

      
      <Avatar />

      <hr className="w-4/5 mx-auto border-gray-300 my-4" />

      <ul className="flex flex-col space-y-4 p-4">
        <li>
          <a href="#home" className="text-black hover:text-blue-500">
            Home
          </a>
        </li>
        <li>
          <a href="#about" className="text-black hover:text-blue-500">
            About
          </a>
        </li>
        <li>
          <a href="#contact" className="text-black hover:text-blue-500">
            Contact
          </a>
        </li>
      </ul>

      <div className="flex items-center justify-center mt-8">

      </div>
    </nav>
  );
};

export default Sidebar;
