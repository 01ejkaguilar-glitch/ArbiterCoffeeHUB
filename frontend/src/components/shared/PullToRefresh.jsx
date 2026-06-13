import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './PullToRefresh.css';

const PullToRefresh = ({ children, onRefresh, refreshThreshold = 100 }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragDistance, setDragDistance] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (isRefreshing) return;
    const touch = e.touches[0];
    setDragStartY(touch.clientY);
    setDragDistance(0);
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (isRefreshing || dragStartY === null) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const distance = currentY - dragStartY;

    // Only allow pulling down (not scrolling up)
    if (distance <= 0) {
      setDragStartY(null);
      return;
    }

    setDragDistance(distance);

    // Prevent scrolling while pulling
    if (distance < refreshThreshold) {
      e.preventDefault();
    }
  }, [isRefreshing, dragStartY, refreshThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (isRefreshing || dragStartY === null) return;

    if (dragDistance >= refreshThreshold) {
      setIsRefreshing(true);
      // Call the refresh function
      Promise.resolve(onRefresh()).finally(() => {
        setIsRefreshing(false);
        setDragStartY(null);
        setDragDistance(0);
      });
    } else {
      setDragStartY(null);
      setDragDistance(0);
    }
  }, [isRefreshing, dragStartY, dragDistance, refreshThreshold, onRefresh]);

  const handleMouseDown = useCallback((e) => {
    if (isRefreshing) return;
    setDragStartY(e.clientY);
    setDragDistance(0);
  }, [isRefreshing]);

  const handleMouseMove = useCallback((e) => {
    if (isRefreshing || dragStartY === null) return;

    const currentY = e.clientY;
    const distance = currentY - dragStartY;

    // Only allow pulling down (not scrolling up)
    if (distance <= 0) {
      setDragStartY(null);
      return;
    }

    setDragDistance(distance);

    // Prevent scrolling while pulling
    if (distance < refreshThreshold) {
      e.preventDefault();
    }
  }, [isRefreshing, dragStartY, refreshThreshold]);

  const handleMouseUp = useCallback(() => {
    if (isRefreshing || dragStartY === null) return;

    if (dragDistance >= refreshThreshold) {
      setIsRefreshing(true);
      // Call the refresh function
      Promise.resolve(onRefresh()).finally(() => {
        setIsRefreshing(false);
        setDragStartY(null);
        setDragDistance(0);
      });
    } else {
      setDragStartY(null);
      setDragDistance(0);
    }
  }, [isRefreshing, dragStartY, dragDistance, refreshThreshold, onRefresh]);

  const handleMouseLeave = useCallback(() => {
    if (!isRefreshing && dragStartY !== null) {
      setDragStartY(null);
      setDragDistance(0);
    }
  }, [isRefreshing, dragStartY]);

  // Inertia scrolling compensation - allow natural scrolling when not pulling
  const shouldAllowScroll = dragStartY === null || isRefreshing || dragDistance >= refreshThreshold;

  const refreshIndicatorStyle = {
    opacity: isRefreshing ? 1 : Math.min(dragDistance / refreshThreshold, 1),
    transform: `translateY(${isRefreshing ? 0 : -dragDistance}px) scale(${isRefreshing ? 1 : Math.max(0.8, dragDistance / refreshThreshold * 0.2 + 0.8)})`,
    transition: isRefreshing ? 'opacity 0.3s ease' : 'opacity 0s ease, transform 0s ease'
  };

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        overflowY: shouldAllowScroll ? 'auto' : 'hidden',
        position: 'relative'
      }}
    >
      {/* Refresh Indicator */}
      <div className="pull-to-refresh-indicator" style={refreshIndicatorStyle}>
        {isRefreshing ? (
          <div className="refresh-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="pull-down-label">
            {dragDistance < refreshThreshold / 2 ? 'Pull down to refresh' : 'Release to refresh'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pull-to-refresh-content">
        {children}
      </div>
    </div>
  );
};

PullToRefresh.defaultProps = {
  refreshThreshold: 100
};

PullToRefresh.propTypes = {
  children: PropTypes.node.isRequired,
  onRefresh: PropTypes.func.isRequired,
  refreshThreshold: PropTypes.number
};

export default PullToRefresh;