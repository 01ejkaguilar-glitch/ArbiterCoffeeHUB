import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ type = 'error', message, actions = [] }) => {
  const iconMap = {
    error: 'error-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    success: 'check-circle'
  };

  // Default to error if type is not valid
  const validType = iconMap[type] ? type : 'error';

  return (
    <div className={`error-message alert alert-${validType}`}>
      <i
        className={`bi bi-${iconMap[validType]} me-2`}
        role="img"
        aria-label={`${validType} icon`}
      />
      <span>{message}</span>

      {actions.length > 0 && (
        <div className="error-message-actions mt-3">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`btn btn-${action.variant || 'primary'} btn-sm me-2`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  message: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'])
    })
  )
};

ErrorMessage.defaultProps = {
  type: 'error',
  actions: []
};

export default ErrorMessage;