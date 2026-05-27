import React from 'react';
import PropTypes from 'prop-types';
import './Form.css';

const Form = ({
  children,
  onSubmit,
  className = '',
  inline = false,
  validated = false,
  ...props
}) => {
  return (
    <form
      className={`form ${className} ${inline ? 'form-inline' : ''} ${validated ? 'was-validated' : ''}`}
      onSubmit={onSubmit}
      noValidate={validated}
      {...props}
    >
      {children}
    </form>
  );
};

Form.propTypes = {
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  className: PropTypes.string,
  inline: PropTypes.bool,
  validated: PropTypes.bool,
};

Form.defaultProps = {
  children: null,
  onSubmit: () => {},
  className: '',
  inline: false,
  validated: false,
};

export default Form;