import React, { useEffect, useRef } from 'react';
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
  const formRef = useRef(null);

  useEffect(() => {
    const node = formRef.current;

    if (!node) {
      return undefined;
    }

    const handleMouseEnter = () => {
      node.classList.add('hover-effect');
    };
    const handleMouseLeave = () => {
      node.classList.remove('hover-effect');
    };

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <form
      ref={formRef}
      className={`form ${className} ${inline ? 'form-inline' : ''} ${validated ? 'was-validated' : ''}`}
      role="form"
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