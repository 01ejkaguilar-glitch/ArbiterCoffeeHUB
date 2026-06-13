import React from 'react';
import PropTypes from 'prop-types';

const SkeletonCard = ({
  titleWidth = '60px',
  subtitleWidth = '80%',
  footerWidth = '40%',
  className = ''
}) => {
  return (
    <div
      role="region"
      aria-label="card"
      className={`skeleton-card ${className}`}
      style={{ height: '120px', borderRadius: '8px', overflow: 'hidden' }}
    >
      <div className="skeleton" style={{
        height: '20px',
        width: titleWidth,
        marginBottom: '12px',
        borderRadius: '4px'
      }} />
      <div className="skeleton" style={{
        height: '16px',
        width: subtitleWidth,
        marginBottom: '8px',
        borderRadius: '4px'
      }} />
      <div className="skeleton" style={{
        height: '14px',
        width: footerWidth,
        marginBottom: '16px',
        borderRadius: '4px'
      }} />
      <div className="skeleton" style={{
        height: '12px',
        width: '60%',
        borderRadius: '4px'
      }} />
    </div>
  );
};

SkeletonCard.propTypes = {
  titleWidth: PropTypes.string,
  subtitleWidth: PropTypes.string,
  footerWidth: PropTypes.string,
  className: PropTypes.string
};

SkeletonCard.defaultProps = {
  titleWidth: '60%',
  subtitleWidth: '80%',
  footerWidth: '40%',
  className: ''
};

export default SkeletonCard;