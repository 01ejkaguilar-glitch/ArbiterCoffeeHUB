import React from 'react';
import PropTypes from 'prop-types';
import './Row.css';

const ResponsiveRow = ({
  children,
  className = '',
  gap = '',
  justify = '',
  align = '',
  ...props
}) => {
  return (
    <div
      className={`row ${className} gap-${gap} justify-content-${justify} align-items-${align}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.oneOf(['', '1', '2', '3', '4', '5']),
  justify: PropTypes.oneOf(['', 'start', 'end', 'center', 'between', 'around', 'evenly']),
  align: PropTypes.oneOf(['', 'start', 'end', 'center', 'baseline', 'stretch'])
};

export default ResponsiveRow;