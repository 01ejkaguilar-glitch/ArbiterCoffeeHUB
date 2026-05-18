import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const ResponsiveButton = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  block = false,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''} ${block ? 'w-100' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

ResponsiveButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  block: PropTypes.bool
};

export default ResponsiveButton;