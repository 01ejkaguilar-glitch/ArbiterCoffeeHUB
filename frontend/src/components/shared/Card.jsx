import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';
import { HoverEffect } from './HoverEffect';

const Card = ({
  children,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  imgProps = {},
  title,
  subtitle,
  footer,
  ...props
}) => {
  return (
    <HoverEffect className={className}>
      <div className={`card ${className}`} {...props}>
        {imgProps && (
          <div className="card-img-top">
            <img {...imgProps} alt="" />
          </div>
        )}

        {title || subtitle ? (
          <div className={`card-header ${headerClassName}`}>
            {title && <h5 className="card-title mb-1">{title}</h5>}
            {subtitle && <h6 className="card-subtitle mb-0 text-muted">{subtitle}</h6>}
          </div>
        ) : null}

        <div className={`card-body ${bodyClassName}`}>
          {children}
        </div>

        {footer ? (
          <div className={`card-footer ${footerClassName}`}>
            {footer}
          </div>
        ) : null}
      </div>
    </HoverEffect>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  imgProps: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
};

Card.defaultProps = {
  className: '',
  bodyClassName: '',
  headerClassName: '',
  footerClassName: '',
  imgProps: {},
  title: '',
  subtitle: '',
  footer: null,
};

export default Card;