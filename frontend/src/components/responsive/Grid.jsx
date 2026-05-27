import React from 'react';
import PropTypes from 'prop-types';
import './Grid.css';

const ResponsiveGrid = ({
  children,
  className = '',
  columns = '1',
  gap = '3',
  ...props
}) => {
  return (
    <div
      className={`grid grid-cols-${columns} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  columns: PropTypes.oneOf(['1', '2', '3', '4', '5', '6']),
  gap: PropTypes.oneOf(['', '1', '2', '3', '4', '5'])
};

export default ResponsiveGrid;