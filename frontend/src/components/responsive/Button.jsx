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
  const handleClick = (e) => {
    // Prevent form submission when button is not explicitly type="submit"
    if (!disabled) {
      e.preventDefault();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter and Space keys to trigger click
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size}${disabled ? ' disabled' : ''}${block ? ' btn-block' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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