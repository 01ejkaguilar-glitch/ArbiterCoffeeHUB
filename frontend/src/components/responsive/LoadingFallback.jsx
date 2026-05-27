import React from 'react';
import PropTypes from 'prop-types';
import './LoadingFallback.css';

const ResponsiveLoadingFallback = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-fallback d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary me-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span>{message}</span>
    </div>
  );
};

ResponsiveLoadingFallback.propTypes = {
  message: PropTypes.string
};

export default ResponsiveLoadingFallback;