import React from 'react';
import PropTypes from 'prop-types';
import './ListGroup.css';

const ResponsiveListGroup = ({ children, variant, className = '' }) => {
  // Base class for list group
  const baseClass = 'list-group';

  // Variant classes (if any)
  const variantClass = variant ? `list-group-${variant}` : '';

  return (
    <ul
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children}
    </ul>
  );
};

ResponsiveListGroup.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['flush']), // 'flush' is the variant we use in AdminRecentOrders
  className: PropTypes.string,
};

export default ResponsiveListGroup;