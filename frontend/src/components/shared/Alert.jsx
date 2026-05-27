import React from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

const Alert = ({
  children,
  variant = 'info',
  dismissible = false,
  onClose,
  className = '',
  show = true,
  ...props
}) => {
  if (!show) return null;

  return (
    <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`} {...props} role="alert">
      {dismissible && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  show: PropTypes.bool,
};

Alert.defaultProps = {
  variant: 'info',
  dismissible: false,
  onClose: () => {},
  className: '',
  show: true,
};

export default Alert;