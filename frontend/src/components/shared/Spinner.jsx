import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.css';

const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
  srOnly = true,
  ...props
}) => {
  return (
    <div className={`spinner spinner-${size} spinner-${color} ${className}`} {...props} role="status" aria-label={label || 'Loading...'}>
      <div className="spinner-spinner"></div>
      {label && !srOnly && <span className="spinner-label">{label}</span>}
      {label && srOnly && <span className="visually-hidden">{label}</span>}
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  className: PropTypes.string,
  label: PropTypes.string,
  srOnly: PropTypes.bool,
};

Spinner.defaultProps = {
  size: 'md',
  color: 'primary',
  className: '',
  label: 'Loading...',
  srOnly: true,
};

export default Spinner;