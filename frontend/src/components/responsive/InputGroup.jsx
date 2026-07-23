import React from 'react';
import PropTypes from 'prop-types';
import './InputGroup.css';

const ResponsiveInputGroup = ({ children, className = '' }) => {
  return (
    <div className={`input-group ${className}`}>
      {children}
    </div>
  );
};

ResponsiveInputGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Text component for InputGroup
ResponsiveInputGroup.Text = ({ children, className = '' }) => {
  return (
    <span className={`input-group-text ${className}`}>
      {children}
    </span>
  );
};

ResponsiveInputGroup.Text.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ResponsiveInputGroup;