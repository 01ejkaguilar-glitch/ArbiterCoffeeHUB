import React from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

const ResponsiveAlert = ({ show, onHide, message, type = 'info', dismissible = true }) => {
  if (!show) return null;

  return (
    <div className={`ai-alert ai-alert-${type} ${dismissible ? 'ai-alert-dismissible' : ''} fade show`} role="alert">
      {message}
      {dismissible && (
        <button type="button" className="ai-alert-close" onClick={onHide} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
};

ResponsiveAlert.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['success', 'danger', 'warning', 'info', 'secondary', 'light', 'dark']),
  dismissible: PropTypes.bool
};

export default ResponsiveAlert;