import React from 'react';
import PropTypes from 'prop-types';
import EmptyStateIllustration from './EmptyStateIllustration';

const EmptyState = ({
  illustration = 'default',
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`} >
      <EmptyStateIllustration
        illustration={illustration}
        className="empty-state-illustration"
        size="large"
      />
      {title && (
        <h3 className="empty-state-title mb-4">
          {title}
        </h3>
      )}
      {message && (
        <p className="empty-state-text mb-5">
          {message}
        </p>
      )}
      {action && (
        <div className="empty-state-action">
          {typeof action === 'string' ? (
            <button className="btn btn-primary btn-lg">{action}</button>
          ) : (
            <button
              className={`btn ${action.variant || 'btn-primary'} btn-lg`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  illustration: PropTypes.oneOf([
    'default',
    'orders',
    'products',
    'employees'
  ]),
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string
    })
  ]),
  className: PropTypes.string
};

EmptyState.defaultProps = {
  illustration: 'default',
  title: '',
  message: '',
  action: null,
  className: ''
};

export default EmptyState;