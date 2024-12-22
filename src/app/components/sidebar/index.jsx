import React from "react";
import Avatar from "../avatar";
import { useAuth } from "../auth-provider";
import "./sidebar-styles.css";
import LogoutButton from "../logout-button";
import { motion } from "framer-motion";

const menuItems = [
  { 
    label: 'Home',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )
  },
  { 
    label: 'Profile',
    href: '/settings/profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
    )
  },
  { 
    label: 'Legacy Form',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLScqFE9p85yilbw00gtHi2-aKgXakE8GYg-W2borVuPaXvGapQ/viewform',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    )
  }
];

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  return (
    <nav
      className={`px-4 left-0 z-50 
                  bg-[#1a1a1a]/95 backdrop-blur-sm
                  transform transition-transform duration-200 ease-in-out 
                  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                  absolute inset-x-s0 top-0 flex flex-col
                  border-r border-white/10 w-[240px]
                  rounded-tr-lg rounded-br-lg 
                  shadow-[0_2px_4px_rgba(0,0,0,0.4)]`}
    >
      <motion.div 
        className="flex flex-col items-center py-2 border-b border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Avatar 
          avatarUrl={user?.photoURL}
          displayName={user?.displayName}
          className="w-10 h-10 mb-1"
        />
        <span className="text-sm font-medium text-white/70 tracking-tight">
          {user?.displayName || user?.email || 'Loading...'}
        </span>
      </motion.div>

      <motion.ul 
        className="py-2 space-y-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {menuItems.map((item, index) => (
          <motion.li 
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <motion.a
              href={item.href}
              className="flex items-center space-x-3 px-3 py-1.5 text-sm text-white/70
                       hover:text-[#BFFF00] hover:bg-white/5 rounded 
                       transition-all duration-200"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-4 h-4">
                {item.icon}
              </div>
              <span className="tracking-tight">{item.label}</span>
            </motion.a>
          </motion.li>
        ))}
        
        <motion.li
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.1 + 0.2 }}
        >
          <motion.a 
            className="flex items-center space-x-3 px-3 py-1.5 text-sm text-white/40 cursor-not-allowed"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-4 h-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <span className="tracking-tight">Coming Soon</span>
          </motion.a>
        </motion.li>
      </motion.ul>

      <motion.div 
        className="py-2 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <LogoutButton className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 
                                text-sm bg-red-900/20 text-red-400 hover:bg-red-800/20 
                                rounded transition-colors duration-200 tracking-tight" />
      </motion.div>
    </nav>
  );
};

export default Sidebar;
