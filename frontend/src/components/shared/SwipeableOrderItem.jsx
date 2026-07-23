import React from 'react';
import { useSwipeToDismiss } from '../../hooks/useSwipeToDismiss';
import { FaTimes } from 'react-icons/fa';
import './SwipeableOrderItem.css';

/**
 * Swipeable Order Item Component
 *
 * Touch-optimized order item with swipe-to-dismiss functionality
 * for kitchen dashboard.
 *
 * @module components/shared/SwipeableOrderItem
 */

const SwipeableOrderItem = ({
  order,
  onDismiss,
  onComplete,
  threshold = 100
}) => {
  const {
    swipeState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useSwipeToDismiss(onDismiss, threshold);

  // Calculate priority based on order age or other factors
  const getPriority = () => {
    // For demo purposes, we'll simulate priority based on order ID
    // In real implementation, this would be based on order time, etc.
    const priorityScore = order.id % 3;
    return priorityScore === 0 ? 'high' : priorityScore === 1 ? 'medium' : 'low';
  };

  // Calculate estimated completion time
  const getETA = () => {
    // For demo purposes, we'll simulate ETA
    // In real implementation, this would be based on preparation time, queue length, etc.
    const baseTime = 10; // base 10 minutes
    const itemCount = (order.order_items?.length || order.orderItems?.length || 0) || 1;
    const etaMinutes = baseTime + (itemCount * 2); // 2 minutes per item

    if (etaMinutes <= 5) return { text: 'Soon', type: 'soon' };
    if (etaMinutes <= 15) return { text: `${etaMinutes} min`, type: 'late' };
    return { text: `${etaMinutes} min`, type: 'late' };
  };

  const priority = getPriority();
  const eta = getETA();

  return (
    <div
      key={order.id}
      className={`swipe-order-item ${swipeState.dismissing ? 'dismissing' : swipeState.isSwiping ? 'swiping' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabindex="0"
      aria-label={`Order #${order.order_number || order.id}. Swipe to dismiss.`}
    >
      {/* Visual indicator for swipe progress */}
      {!swipeState.dismissing && (
        <div className="swipe-progress-bar" style={{
          width: `${Math.min(Math.abs(swipeState.currentX - swipeState.startX) / window.innerWidth * 100, 100)}%`,
          background: swipeState.isSwiping ?
            (Math.abs(swipeState.currentX - swipeState.startX) > threshold ? 'var(--color-error)' : 'var(--color-warning-light)') :
            'transparent',
          height: '4px',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'width 0.1s ease, background 0.1s ease',
        }} />
      )}

      {/* Order content */}
      <div className="order-content" style={{
        opacity: swipeState.dismissing ? 0 : 1,
        transform: swipeState.dismissing ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
      }}>
        <div className="d-flex w-100 justify-content-between align-items-start">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-start">
              <div className="me-3">
                <div className={`priority-dot priority-${priority}`} />
              </div>
              <div>
                <h6 className="mb-1">
                  <strong>#{order.order_number || order.id}</strong>
                </h6>
                <p className="mb-1">
                  <strong>{order.user?.name || order.customer_name || 'Guest'}</strong>
                </p>
                <small className="text-muted">
                  {order.order_items?.length || order.orderItems?.length || 0} item(s)
                </small>
              </div>
            </div>
            <div className="ms-auto d-flex align-items-center">
              <span className={`text-${order.status === 'completed' ? 'success' : order.status === 'preparing' ? 'warning' : order.status === 'pending' ? 'info' : 'secondary'} me-2`}>
                {order.status}
              </span>
              <span className="eta-time eta-${eta.type}">
                {eta.text}
              </span>
            </div>
          </div>

          {/* Dismiss button (visible when swiping) */}
          {swipeState.isSwiping && !swipeState.dismissing && (
            <button
              className="btn-dismiss"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(order.id);
              }}
              aria-label="Dismiss order"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeableOrderItem;