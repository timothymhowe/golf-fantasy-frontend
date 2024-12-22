import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const WidgetContainer = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showBorder, setShowBorder] = useState(defaultExpanded);

  return (
    <div className="
      rounded-md bg-[#1a1a1a]
      border border-white/10
      backdrop-blur-sm
      hover:border-[#BFFF00]/50
      transition-all duration-200
    ">
      <div className={`bg-black/20

      // TODO: 53px is hardcoded to match the height of the pick widget, should make this dynamic in the future, yeah?
      
        ${showBorder ? 'border-b border-white/10' : ''} 
        rounded-t-sm px-2 py-1
        flex items-center justify-between h-[53px] 
      `}>
        <h2 className="text-white/90 font-medium text-xl">
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
            p-1 m-1 border border-white/10 rounded-full
            hover:bg-white/5
            hover:border-white/20
            text-white/70
          `}
          aria-label="Toggle widget"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </motion.button>
      </div>
      
      <motion.div
        initial={{ height: defaultExpanded ? "auto" : 0, opacity: defaultExpanded ? 1 : 0 }}
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
        className="px-[0.1em] rounded-b-sm"
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default WidgetContainer;