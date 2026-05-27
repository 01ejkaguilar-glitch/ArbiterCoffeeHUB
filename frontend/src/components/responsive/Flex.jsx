import React from 'react';
import PropTypes from 'prop-types';
import './Flex.css';

const ResponsiveFlex = ({
  children,
  className = '',
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'start',
  gap = '',
  ...props
}) => {
  return (
    <div
      className={`d-flex flex-${direction} flex-${wrap} justify-content-${justify} align-items-${align} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveFlex.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['row', 'column', 'row-reverse', 'column-reverse']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'between', 'around', 'evenly']),
  align: PropTypes.oneOf(['start', 'end', 'center', 'baseline', 'stretch']),
  gap: PropTypes.oneOf(['', '1', '2', '3', '4', '5'])
};

export default ResponsiveFlex;