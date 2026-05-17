import React from 'react';
import PropTypes from 'prop-types';
import './Form.css';

const ResponsiveForm = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <form
      className={`form ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

ResponsiveForm.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func,
  className: PropTypes.string
};

export default ResponsiveForm;

// Form sub-components
ResponsiveForm.Group = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`form-group ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveForm.Label = ({
  children,
  htmlFor,
  className = '',
  ...props
}) => (
  <label
    className={`form-label ${className}`}
    htmlFor={htmlFor}
    {...props}
  >
    {children}
  </label>
);

ResponsiveForm.Control = ({
  type = 'text',
  placeholder,
  className = '',
  ...props
}) => {
  // Map input types to appropriate elements
  const InputElement = type === 'select' ? 'select' :
                      type === 'textarea' ? 'textarea' : 'input';

  return (
    <InputElement
      className={`form-control ${className}`}
      type={type === 'select' || type === 'textarea' ? undefined : type}
      placeholder={placeholder}
      {...props}
    />
  );
};

ResponsiveForm.Control.propTypes = {
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio']),
  placeholder: PropTypes.string,
  className: PropTypes.string
};

ResponsiveForm.Checkbox = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`form-check ${className}`} {...props}>
    <input
      className="form-check-input"
      type="checkbox"
      {...props}
    />
    <label className="form-check-label">{children}</label>
  </div>
);

ResponsiveForm.Checkbox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

ResponsiveForm.Button = ({
  variant = 'primary',
  size = 'md',
  children,
  type = 'submit',
  ...props
}) => (
  <button
    type={type}
    className={`btn btn-${variant} btn-${size}`}
    {...props}
  >
    {children}
  </button>
);

ResponsiveForm.Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  type: PropTypes.string
};