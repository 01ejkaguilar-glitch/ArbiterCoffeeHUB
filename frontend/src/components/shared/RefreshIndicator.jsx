import React from 'react';
import PropTypes from 'prop-types';

const RefreshIndicator = ({ progress = 0, message = 'Refreshing...' }) => {
  const percent = Math.round(progress * 100);

  return (
    <div className="text-center py-4">
      <div className="progress" style={{ height: '8px', width: '200px', margin: '0 auto' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
          role="progressbar"
          style={{ width: `${percent}%` }}
          aria-valuenow={percent}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <p className="mt-2 text-muted small">{message} {percent}%</p>
    </div>
  );
};

RefreshIndicator.propTypes = {
  progress: PropTypes.number,
  message: PropTypes.string
};

RefreshIndicator.defaultProps = {
  progress: 0,
  message: 'Refreshing...'
};

export default RefreshIndicator;