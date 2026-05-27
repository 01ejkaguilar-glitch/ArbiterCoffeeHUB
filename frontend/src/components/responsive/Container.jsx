import React from 'react';
import PropTypes from 'prop-types';
import './Container.css';

const ResponsiveContainer = ({
  children,
  className = '',
  fluid = false,
  maxWidth = 'lg',
  ...props
}) => {
  const widths = {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    '2xl': '1320px'
  };

  return (
    <div
      className={`${fluid ? 'container-fluid' : 'container'}
                ${className}
                max-width-${maxWidth}`}
      style={{ maxWidth: widths[maxWidth] }}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl'])
};

export default ResponsiveContainer;