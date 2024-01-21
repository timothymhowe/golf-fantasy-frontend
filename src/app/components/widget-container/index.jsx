import React from 'react';
import PropTypes from 'prop-types';

import "./widget-container-styles.css";

const WidgetContainer = ({ children }) => {
    return (
        <div className="widget-container rounded-lg shadow-sm bg-white h-48">
            {children}
        </div>
    );
};

// WidgetContainer.propTypes = {
//     children: PropTypes.node.isRequired,
// };

export default WidgetContainer;
