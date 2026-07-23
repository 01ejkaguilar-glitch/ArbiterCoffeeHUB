import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';

const ResponsiveDropdown = ({
  children,
  show = false,
  onToggle,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(show || false);

  const handleClickOutside = useCallback((event) => {
    if (isOpen && !event.target.closest('.dropdown')) {
      setIsOpen(false);
      if (onToggle) {
        onToggle(false);
      }
    }
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div className={`dropdown ${isOpen ? 'show' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

ResponsiveDropdown.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string
};

// Toggle component
ResponsiveDropdown.Toggle = ({
  children,
  className = '',
  id,
  variant = 'secondary',
  size = 'md',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} dropdown-toggle dropdown-toggle-split ${className}`}
      id={id}
      data-bs-toggle="dropdown"
      aria-expanded="false"
      {...props}
    >
      <span className="visually-hidden">Toggle Dropdown</span>
      {children}
    </button>
  );
};

ResponsiveDropdown.Toggle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg'])
};

// Menu component
ResponsiveDropdown.Menu = ({
  children,
  className = '',
  role = 'menu',
  ...props
}) => {
  return (
    <ul
      className={`dropdown-menu ${className}`}
      role={role}
      {...props}
    >
      {children}
    </ul>
  );
};

ResponsiveDropdown.Menu.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  role: PropTypes.string
};

// Item component
ResponsiveDropdown.Item = ({
  children,
  className = '',
  eventKey,
  onClick,
  ...props
}) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    // Handle eventKey if needed (could be used with a context or parent handler)
  };

  return (
    <li>
      <button
        type="button"
        className={`dropdown-item ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    </li>
  );
};

ResponsiveDropdown.Item.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func
};

export default ResponsiveDropdown;