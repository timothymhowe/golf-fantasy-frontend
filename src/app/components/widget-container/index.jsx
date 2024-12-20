import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const WidgetContainer = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showBorder, setShowBorder] = useState(defaultExpanded);

  return (
    <div className="
      rounded-sm bg-white
      border border-gray-200
      hover:shadow-lg
      transition-all duration-200
    ">
      <div className={`bg-gray-100
        ${showBorder ? 'border-b border-gray-200' : ''} 
        rounded-t-sm px-2 py-1
        flex items-center justify-between
      `}>
        <h2 className="text-gray-600 font-semibold text-lg">
          {title}
        </h2>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className={`
            p-1 m-1 border rounded-full
            hover:bg-gray-200
            hover:border-gray-300
            text-gray-600
          `}
          aria-label="Toggle widget"
        >
          <ChevronDownIcon className="h-5 w-5" />
        </motion.button>
      </div>
      
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        onAnimationStart={() => {
          if (isExpanded) setShowBorder(true);
        }}
        onAnimationComplete={() => {
          if (!isExpanded) setShowBorder(false);
        }}
        transition={{
          height: {
            type: "spring",
            stiffness: 500,
            damping: 40,
            mass: 0.8
          },
          opacity: { 
            duration: 0.2,
            delay: isExpanded ? 0.1 : 0 
          }
        }}
        className="bg-white rounded-b-sm px-[0.1em]"
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default WidgetContainer;