import React from 'react';
import PropTypes from 'prop-types';

const EmptyStateIllustration = ({
  illustration = 'default',
  className = '',
  size = 'medium'
}) => {
  // Define illustration configurations
  const illustrations = {
    default: () => (
      <div className="empty-state-illustration-default" role="img" aria-label="illustration">
        {/* Simple coffee cup illustration */}
        <div className="coffee-cup">
          <div className="cup">
            <div className="rim"></div>
            <div className="body"></div>
            <div className="handle"></div>
          </div>
          <div className="steam">
            <div className="steam-line"></div>
            <div className="steam-line"></div>
          </div>
        </div>
      </div>
    ),
    orders: () => (
      <div className="empty-state-illustration-orders" role="img" aria-label="orders illustration">
        {/* Simple order list illustration */}
        <div className="order-list">
          <div className="order-item">
            <div className="order-info">
              <div className="order-number">#</div>
              <div className="order-details">
                <div className="order-item-name"></div>
                <div className="order-item-price"></div>
              </div>
            </div>
          </div>
          <div className="order-item">
            <div className="order-info">
              <div className="order-number">#</div>
              <div className="order-details">
                <div className="order-item-name"></div>
                <div className="order-item-price"></div>
              </div>
            </div>
          </div>
          <div className="order-item">
            <div className="order-info">
              <div className="order-number">#</div>
              <div className="order-details">
                <div className="order-item-name"></div>
                <div className="order-item-price"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    products: () => (
      <div className="empty-state-illustration-products" role="img" aria-label="products illustration">
        {/* Simple product grid illustration */}
        <div className="product-grid">
          <div className="product-item">
            <div className="product-image"></div>
            <div className="product-info">
              <div className="product-name"></div>
              <div className="product-price"></div>
            </div>
          </div>
          <div className="product-item">
            <div className="product-image"></div>
            <div className="product-info">
              <div className="product-name"></div>
              <div className="product-price"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    employees: () => (
      <div className="empty-state-illustration-employees" role="img" aria-label="employees illustration">
        {/* Simple team illustration */}
        <div className="team">
          <div className="person">
            <div className="person-avatar"></div>
            <div className="person-name"></div>
          </div>
          <div className="person">
            <div className="person-avatar"></div>
            <div className="person-name"></div>
          </div>
          <div className="person">
            <div className="person-avatar"></div>
            <div className="person-name"></div>
          </div>
        </div>
      </div>
    )
  };

  // Get the illustration or default to 'default'
  const Illustration = illustrations[illustration] || illustrations.default;

  // Size configurations
  const sizeStyles = {
    small: { width: '80px', height: '80px' },
    medium: { width: '120px', height: '120px' },
    large: { width: '180px', height: '180px' }
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  return (
    <div className={`empty-state-illustration ${className}`} style={style}>
      <Illustration />
    </div>
  );
};

EmptyStateIllustration.propTypes = {
  illustration: PropTypes.oneOf([
    'default',
    'orders',
    'products',
    'employees'
  ]),
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

EmptyStateIllustration.defaultProps = {
  illustration: 'default',
  className: '',
  size: 'medium'
};

export default EmptyStateIllustration;