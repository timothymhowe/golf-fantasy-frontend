import React, { useState } from "react";
import "./widget-container-styles.css";

const WidgetContainer = ({ title, maxHeight, children, defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="widget-container px-[10px] py-1 rounded-lg bg-white text-gray-700 overflow-hidden h-fit max-h-[calc(40vh-2rem)]">
      <div className="flex justify-between items-center pr-2">
        <div className="text-lg text-gray-600">
          {title}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-gray-600"
          aria-label={isCollapsed ? "Expand widget" : "Collapse widget"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className={`${isCollapsed ? 'hidden' : 'overflow-auto relative'} max-h-[calc(40vh-6rem)]`}>
        <hr className="border-gray-300 mx-auto pb-2" />
        <div className="flex justify-center relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default WidgetContainer;