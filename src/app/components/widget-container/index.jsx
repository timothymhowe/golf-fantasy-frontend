import React from 'react';
import PropTypes from 'prop-types';

const WidgetContainer = ({ children }) => {
    return (
        <div className="rounded-lg shadow-sm bg-white">
            {children}
        </div>
    );
};

// WidgetContainer.propTypes = {
//     children: PropTypes.node.isRequired,
// };

export default WidgetContainer;
