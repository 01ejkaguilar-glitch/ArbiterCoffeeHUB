import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const ResponsiveCard = ({
  children,
  className = '',
  header,
  body,
  footer,
  ...props
}) => {
  return (
    <div
      className={`card ${className}`}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{body || children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

ResponsiveCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default ResponsiveCard;

// Sub-components for semantic structure
ResponsiveCard.Header = ({ children, className, ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveCard.Body = ({ children, className, ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveCard.Footer = ({ children, className, ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);