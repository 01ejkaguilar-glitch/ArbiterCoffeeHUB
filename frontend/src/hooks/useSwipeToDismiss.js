import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling swipe-to-dismiss gestures
 * @param {Function} onDismissed - Callback function to execute when item is dismissed
 * @param {number} threshold - Minimum pixel distance to trigger dismiss (default: 100)
 * @returns {Object} Object containing swipe state and event handlers
 */
export const useSwipeToDismiss = (onDismissed, threshold = 100) => {
  const [swipeState, setSwipeState] = useState({
    startX: 0,
    currentX: 0,
    isSwiping: false,
    dismissing: false
  });

  const handleTouchStart = useCallback((e) => {
    setSwipeState({
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isSwiping: true,
      dismissing: false
    });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!swipeState.isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeState.startX;

    setSwipeState({
      ...swipeState,
      currentX,
      isSwiping: true,
      dismissing: Math.abs(diff) > threshold
    });
  }, [swipeState, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!swipeState.isSwiping) return;

    const diff = swipeState.currentX - swipeState.startX;

    if (Math.abs(diff) > threshold) {
      setSwipeState({
        ...swipeState,
        isSwiping: false,
        dismissing: true
      });

      // Wait for animation to complete before calling onDismissed
      await new Promise(resolve => setTimeout(resolve, 300));
      onDismissed();
    } else {
      setSwipeState({
        ...swipeState,
        isSwiping: false,
        dismissing: false
      });
    }
  }, [swipeState, threshold, onDismissed]);

  // Reset on component unmount or when needed
  useEffect(() => {
    return () => {
      setSwipeState({
        startX: 0,
        currentX: 0,
        isSwiping: false,
        dismissing: false
      });
    };
  }, []);

  return {
    swipeState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};