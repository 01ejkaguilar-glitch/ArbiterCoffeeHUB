import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.css';

const ResponsiveSpinner = ({
  animation = 'border',
  size = 'sm',
  className = ''
}) => {
  // Map size to width/height in pixels
  const sizeMap = {
    'xs': '1rem',
    'sm': '1.5rem',
    'md': '2rem',
    'lg': '2.5rem',
    'xl': '3rem'
  };
  const widthHeight = sizeMap[size] || sizeMap['sm'];

  return (
    <div className={`spinner-${animation} ${className}`} role="status" style={{ width: widthHeight, height: widthHeight }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

ResponsiveSpinner.propTypes = {
  animation: PropTypes.oneOf(['border', 'grow']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

export default ResponsiveSpinner;