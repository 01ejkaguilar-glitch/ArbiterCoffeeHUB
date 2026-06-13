import React, { useState, useCallback } from 'react';
import { FaClock, FaEye, FaUtensils, FaThumbsUp, FaCheckCircle, FaTimes, FaSync } from 'react-icons/fa';
import ResponsiveCard from '@/components/responsive/Card';

const STATUS_ACTIONS = {
  pending: [
    { label: 'Confirm', status: 'confirmed', icon: FaThumbsUp },
    { label: 'Prep', status: 'preparing', icon: FaUtensils },
  ],
  confirmed: [
    { label: 'Prep', status: 'preparing', icon: FaUtensils },
  ],
  preparing: [
    { label: 'Ready', status: 'ready', icon: FaCheckCircle },
  ],
  ready: [
    { label: 'Complete', status: 'completed', icon: FaCheckCircle },
  ],
};

const formatStatusLabel = (value) => String(value || 'pending').replaceAll('_', ' ');

const OrderCard = ({
  order,
  timer,
  updatingOrder,
  onUpdateStatus,
  onViewDetail,
  formatElapsedTime,
}) => {
  const actions = STATUS_ACTIONS[order?.status] || [];
  const items = order?.order_items || order?.items || [];
  const total = order?.total_amount ?? order?.total ?? null;
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);

  // Calculate priority based on wait time and order status
  const calculatePriority = useCallback(() => {
    if (!order) return 'low';

    const now = Date.now();
    let priorityScore = 0;

    // Base priority by status
    switch (order.status) {
      case 'pending':
        // Pending orders get priority based on wait time
        const orderTime = new Date(order.created_at || order.updated_at).getTime();
        const waitTime = now - orderTime;
        // Higher wait time = higher priority
        priorityScore = Math.min(waitTime / (1000 * 60 * 5), 3); // Cap at 3 for 5+ minutes
        break;
      case 'confirmed':
        // Confirmed orders get medium priority
        priorityScore = 1;
        break;
      case 'preparing':
        // Preparing orders get priority based on preparation time
        if (timer && timer.elapsed) {
          // Longer preparation time = higher priority (might be delayed)
          priorityScore = Math.min(timer.elapsed / (1000 * 60 * 10), 3); // Cap at 3 for 10+ minutes
        } else {
          priorityScore = 0.5;
        }
        break;
      case 'ready':
        // Ready orders get lower priority (should be picked up soon)
        priorityScore = 0.5;
        break;
      default:
        priorityScore = 0;
    }

    // Adjust for order type (dine-in might get slightly higher priority)
    if (order.order_type === 'dine_in') {
      priorityScore += 0.5;
    }

    // Convert score to priority level
    if (priorityScore >= 2.5) return 'high';
    if (priorityScore >= 1.5) return 'medium';
    return 'low';
  }, [order, timer]);

  // Calculate estimated completion time
  const getEstimatedCompletionTime = useCallback(() => {
    if (!order) return null;

    const now = Date.now();
    let estimatedMinutes = null;

    switch (order.status) {
      case 'pending':
        // Estimated time to start preparing + average preparation time
        const orderTime = new Date(order.created_at || order.updated_at).getTime();
        const waitTime = now - orderTime;
        // Assume it will start soon, then add average prep time
        estimatedMinutes = Math.max(0, 5 - waitTime / (1000 * 60)) + 15; // 5 min wait + 15 min prep
        break;
      case 'confirmed':
        // Estimated time to start + average preparation time
        estimatedMinutes = 15; // 15 minutes average preparation
        break;
      case 'preparing':
        if (timer && timer.elapsed) {
          // Already preparing, estimate remaining time
          const elapsedMinutes = timer.elapsed / (1000 * 60);
          const avgPrepTime = 20; // Assume 20 minutes average
          estimatedMinutes = Math.max(0, avgPrepTime - elapsedMinutes);
        } else {
          estimatedMinutes = 15; // Default estimate
        }
        break;
      case 'ready':
        // Ready for pickup, minimal time
        estimatedMinutes = 2; // 2 minutes to pickup
        break;
      default:
        estimatedMinutes = 15;
    }

    return Math.max(0, Math.round(estimatedMinutes));
  }, [order, timer]);

  // Handle touch start for swipe-to-dismiss
  const handleTouchStart = useCallback((e) => {
    if (window.innerWidth <= 768) { // Mobile breakpoint
      setSwipeStartX(e.touches[0].clientX);
      setIsSwiping(true);
    }
  }, []);

  // Handle touch move for swipe-to-dismiss
  const handleTouchMove = useCallback((e) => {
    if (!isSwiping || window.innerWidth > 768) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeStartX;

    // Update swipe direction based on movement
    if (Math.abs(diff) > 10) { // Minimum swipe distance
      if (diff > 0) {
        setSwipeDirection('right'); // Swipe right to complete
      } else {
        setSwipeDirection('left'); // Swipe left to cancel
      }
    }
  }, [isSwiping, swipeStartX]);

  // Handle touch end for swipe-to-dismiss
  const handleTouchEnd = useCallback(() => {
    if (!isSwiping || window.innerWidth > 768) return;

    const endX = e.changedTouches ? e.changedTouches[0].clientX : 0;
    const diff = endX - swipeStartX;

    // Only act if we've swiped far enough (minimum 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0 && order?.status === 'preparing') {
        // Swipe right on preparing order = complete it
        onUpdateStatus?.(order?.id, 'completed');
      } else if (diff < 0 && order?.status !== 'completed' && order?.status !== 'cancelled') {
        // Swipe left on non-completed order = cancel it
        onUpdateStatus?.(order?.id, 'cancelled');
      }
    }

    // Reset swipe state
    setSwipeDirection(null);
    setIsSwiping(false);
    setSwipeStartX(0);
  }, [order?.id, onUpdateStatus, order?.status]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Prevent form inputs from triggering shortcuts
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case 'c': // Confirm
        if (order?.status === 'pending') {
          e.preventDefault();
          onUpdateStatus?.(order?.id, 'confirmed');
        }
        break;
      case 'p': // Prepare
        if (order?.status === 'confirmed' || order?.status === 'pending') {
          e.preventDefault();
          onUpdateStatus?.(order?.id, 'preparing');
        }
        break;
      case 'r': // Ready
        if (order?.status === 'preparing') {
          e.preventDefault();
          onUpdateStatus?.(order?.id, 'ready');
        }
        break;
      case 'x': // Complete
        if (order?.status === 'ready') {
          e.preventDefault();
          onUpdateStatus?.(order?.id, 'completed');
        }
        break;
      case 'Escape': // Cancel
        if (order?.status !== 'completed' && order?.status !== 'cancelled') {
          e.preventDefault();
          onUpdateStatus?.(order?.id, 'cancelled');
        }
        break;
      case 'v': // View details
        e.preventDefault();
        onViewDetail?.(order);
        break;
      default:
        break;
    }
  }, [order?.status, order?.id, onUpdateStatus, onViewDetail]);

  return (
    <ResponsiveCard
      className={`border-0 shadow-sm h-100 ${order?.status || 'pending'} priority-${calculatePriority()}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0} // Make card focusable for keyboard events
    >
      {order?.status === 'preparing' && timer && (
        <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="oq-order-num">#{order?.order_number || order?.id}</span>
            <span className="oq-label">{formatStatusLabel(order?.status)}</span>
          </div>
          <div className="d-flex align-items-center">
            <FaClock /> {formatElapsedTime(timer.elapsed)}
          </div>
        </ResponsiveCard.Header>
      )}

      {(order?.status !== 'preparing' || !timer) && (
        <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="oq-order-num">#{order?.order_number || order?.id}</span>
            <span className="oq-label">{formatStatusLabel(order?.status)}</span>
          </div>
          <span className="oq-order-time">
            {order?.order_type ? formatStatusLabel(order.order_type) : 'dine in'}
          </span>
        </ResponsiveCard.Header>
      )}

      <ResponsiveCard.Body className="p-3">
        <div className="mb-2">
          <div className="fw-medium">{order?.user?.name || order?.customer_name || 'Guest'}</div>
        </div>

        <div className="mb-3">
          {items.map((item, index) => (
            <div key={`${item?.id || index}`} className="d-flex justify-content-between">
              <span>{item?.quantity ?? 1}×</span>
              <span>{item?.product?.name || item?.product_name || item?.name || 'Item'}</span>
              {item?.price != null && <span className="ms-auto">${Number(item.price).toFixed(2)}</span>}
            </div>
          ))}
        </div>

        {order?.notes && (
          <div className="mb-3">
            <p>{order.notes}</p>
          </div>
        )}

        {/* Estimated completion time for pending, confirmed, preparing */}
        {['pending', 'confirmed', 'preparing'].includes(order?.status || '') && (
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span>Estimated Completion:</span>
              <span className="fw-medium">{getEstimatedCompletionTime()} min</span>
            </div>
          </div>
        )}

        {timer && order?.status === 'preparing' && (
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span>Preparation Time:</span>
              <span className="fw-medium">{formatElapsedTime(timer.elapsed)}</span>
              {timer.elapsed >= 15 * 60 * 1000 && (
                <span className="badge bg-danger">URGENT</span>
              )}
            </div>
          </div>
        )}
      </ResponsiveCard.Body>

      <ResponsiveCard.Footer className="p-3">
        {total != null && (
          <div className="d-flex justify-content-between">
            <span>Total:</span>
            <span className="fw-medium">${Number(total).toFixed(2)}</span>
          </div>
        )}

        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={() => onViewDetail?.(order)} aria-label="View order details">
            <FaEye /> Details
          </button>

          <div className="d-flex gap-2">
            {actions.map((action) => (
              <button
                key={action.status}
                type="button"
                className={`btn btn-outline-${action.status === 'confirmed' ? 'success' : action.status === 'preparing' ? 'primary' : 'info'} btn-sm me-1`}
                disabled={updatingOrder === order?.id}
                onClick={() => onUpdateStatus?.(order?.id, action.status)}
              >
                {updatingOrder === order?.id ? <span className="me-2"><FaSync className="fa-spin" /> </span> : <action.icon />}
                {action.label}
              </button>
            ))}

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onUpdateStatus?.(order?.id, 'cancelled')}
              aria-label="Cancel order"
              disabled={updatingOrder === order?.id}
            >
              {updatingOrder === order?.id ? <span className="me-2"><FaSync className="fa-spin" /> </span> : <FaTimes />}
              Cancel
            </button>
          </div>
        </div>
        </ResponsiveCard.Footer>
      </ResponsiveCard>
  );
};

export default OrderCard;