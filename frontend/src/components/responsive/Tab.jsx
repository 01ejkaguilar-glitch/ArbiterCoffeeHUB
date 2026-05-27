import React from 'react';
import PropTypes from 'prop-types';
import './Tab.css';

const ResponsiveTab = ({
  active = false,
  disabled = false,
  onSelect,
  children,
  className = '',
  eventKey,
  ...props
}) => {
  if (disabled) {
    return (
      <div
        role="tab"
        aria-selected={false}
        aria-disabled={true}
        tabIndex={-1}
        className={`tab ${className} disabled`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="tab"
      aria-selected={active}
      aria-disabled={false}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={`tab ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveTab.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ResponsiveTab;