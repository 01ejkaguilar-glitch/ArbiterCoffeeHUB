import React from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';
import './Tabs.css';

const ResponsiveTabs = ({
  activeKey,
  onSelect,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`tabs ${className}`}
      role="tablist"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isActive = child.props.eventKey === activeKey;
        const tabProps = {
          ...child.props,
          active: isActive,
          onSelect: () => onSelect(child.props.eventKey),
          key: child.props.eventKey || index
        };

        return React.cloneElement(child, tabProps);
      })}
    </div>
  );
};

ResponsiveTabs.propTypes = {
  activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ResponsiveTabs.Tab = Tab;

export default ResponsiveTabs;