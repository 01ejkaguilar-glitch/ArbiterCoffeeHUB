import React from 'react';
import PropTypes from 'prop-types';
import './ProgressBar.css';

const ResponsiveProgressBar = ({
  now = 0,
  min = 0,
  max = 100,
  label,
  striped = false,
  animated = false,
  variant = 'success', // success, info, warning, danger
  className = ''
}) => {
  const percent = ((now - min) / (max - min)) * 100;
  const backgroundColor = {
    success: 'var(--color-success-green)',
    info: 'var(--color-info-blue)',
    warning: 'var(--color-warning-amber)',
    danger: 'var(--color-danger-red)'
  }[variant] || 'var(--color-success-green)';

  return (
    <div className={`progress ${striped ? 'progress-bar-striped' : ''} ${animated ? 'progress-bar-animated' : ''} ${className}`} role="progressbar" aria-label={label} aria-valuenow={now} aria-valuemin={min} aria-valuemax={max} style={{ width: `${percent}%`, backgroundColor }}>
      {label}
    </div>
  );
};

ResponsiveProgressBar.propTypes = {
  now: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.node,
  striped: PropTypes.bool,
  animated: PropTypes.bool,
  variant: PropTypes.oneOf(['success', 'info', 'warning', 'danger']),
  className: PropTypes.string
};

export default ResponsiveProgressBar;