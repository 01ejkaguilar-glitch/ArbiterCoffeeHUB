import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

const Badge = ({
  children,
  variant = 'secondary',
  pill = false,
  className = '',
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${pill ? 'badge-pill' : ''} ${className}`} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  pill: PropTypes.bool,
  className: PropTypes.string,
};

Badge.defaultProps = {
  variant: 'secondary',
  pill: false,
  className: '',
};

export default Badge;