'ren'
import react from "react";
import Avatar from "../avatar";

import "./sidebar-styles.css";

const Sidebar = ({ isOpen }) => {
  return (
    <nav
      className={`left-0 h-auto w-48 bg-white transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0 open" : "-translate-x-full"
      } sidebar`}
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

      <div className="flex items-center justify-center mt-8"></div>
    </nav>
  );
};

export default Sidebar;
