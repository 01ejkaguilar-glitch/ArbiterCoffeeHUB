import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

const ResponsiveBadge = ({ variant = 'secondary', children }) => {
  return (
    <span className={`ai-badge ai-badge-${variant}`}>
      {children}
    </span>
  );
};

ResponsiveBadge.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  children: PropTypes.node.isRequired,
};

export default ResponsiveBadge;