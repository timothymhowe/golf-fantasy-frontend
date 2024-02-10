import React from "react";
import "./widget-container-styles.css";

const WidgetContainer = ({ title, maxHeight, children }) => {
  return (
    <div className={`widget-container px-[10px] py-1 rounded-lg drop-shadow-lg bg-white text-gray-700 mb-2 h-auto`}>
      <div className="text-lg text-gray-600">
        {title}
      </div>
      <hr className="border-gray-300 mx-auto pb-2" />
      <div className="widget-body flex overflow-auto justify-center">
        {children}
      </div>
    </div>
  );
};

export default WidgetContainer;