import React from 'react';
import PropTypes from 'prop-types';
import './Stack.css';

const ResponsiveStack = ({
  children,
  className = '',
  direction = 'column',
  gap = '3',
  ...props
}) => {
  return (
    <div
      className={`d-flex flex-${direction} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveStack.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['column', 'row', 'column-reverse', 'row-reverse']),
  gap: PropTypes.oneOf(['', '1', '2', '3', '4', '5'])
};

export default ResponsiveStack;