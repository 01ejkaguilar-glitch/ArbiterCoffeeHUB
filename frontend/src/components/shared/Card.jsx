import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Card.css';

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
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;

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
    <div
      ref={cardRef}
      className={`card ${className}`}
      role="region"
      {...props}
    >
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