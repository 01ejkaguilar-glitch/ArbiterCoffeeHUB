import React, { useEffect, useRef } from 'react';
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
  const buttonRef = useRef(null);

  useEffect(() => {
    const node = buttonRef.current;

    if (!node) {
      return undefined;
    }

    const wrapper = node.parentElement;
    const handleMouseEnter = () => {
      wrapper?.classList.add('hover-effect');
    };
    const handleMouseLeave = () => {
      wrapper?.classList.remove('hover-effect');
    };

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Prevent native button behavior when not rendering as button
  const type = asChild && Component !== 'button' ? undefined : (loading || disabled ? undefined : 'button');

  const handleClick = (e) => {
    // Prevent form submission when button is not explicitly type="submit"
    if (!disabled && !loading && type !== 'submit') {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter and Space keys to trigger click
    if (!disabled && !loading && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Create and dispatch a click event
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      e.currentTarget.dispatchEvent(clickEvent);
    }
  };

  return (
    <div className={className}>
      <Component
        ref={buttonRef}
        className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${outline ? 'btn-outline' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
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
    </div>
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