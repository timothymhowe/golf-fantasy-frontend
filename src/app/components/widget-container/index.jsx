import React from "react";
import PropTypes from "prop-types";

import "./widget-container-styles.css";

const WidgetContainer = ({ title, children }) => {
  return (
    <div className="widget-container p-5 rounded-lg shadow-sm bg-white h-48 text-gray-700 mb-2 h-auto">
      <div className="widget-title text-lg text-gray-600 p-2">
        {title}
      </div>
      <hr className="border-gray-300 mx-auto" />

      <div className="widget-body flex  max-h-[200px] overflow-auto">
        {children}
      </div>
    </div>
  );
};

// WidgetContainer.propTypes = {
//     children: PropTypes.node.isRequired,
// };

export default WidgetContainer;