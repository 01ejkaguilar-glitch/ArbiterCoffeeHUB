import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  outline = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  asChild = false,
  className = '',
  ...props
}) => {
  const Component = asChild ? props.component || 'button' : 'button';

  // Prevent native button behavior when not rendering as button
  const type = asChild && Component !== 'button' ? undefined : (loading || disabled ? undefined : 'button');

  return (
    <Component
      className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${outline ? 'btn-outline' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${className}`}
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-loading-indicator">
          {/* Simple loading spinner */}
          <span className="btn-loading-spinner" />
        </span>
      )}

      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}

      <span className="btn-content">
        {children}
      </span>

      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  block: PropTypes.bool,
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  asChild: PropTypes.bool,
  className: PropTypes.string,
  component: PropTypes.elementType,
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  block: false,
  outline: false,
  disabled: false,
  loading: false,
  icon: null,
  iconPosition: 'left',
  asChild: false,
  className: '',
};

export default Button;