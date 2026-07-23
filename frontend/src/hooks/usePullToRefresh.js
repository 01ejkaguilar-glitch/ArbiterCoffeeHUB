import { useCallback, useRef, useEffect } from 'react';

export const usePullToRefresh = (onRefresh, options = {}) => {
  const { threshold = 100 } = options;
  const startYRef = useRef(null);
  const draggingRef = useRef(false);

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!draggingRef.current || !startYRef.current) return;

    const currentY = e.touches[0].clientY;
    const diffY = currentY - startYRef.current;

    // Only trigger when dragging down
    if (diffY > 0 && diffY > threshold) {
      draggingRef.current = false;
      startYRef.current = null;
      onRefresh();
    }
  }, [onRefresh, threshold, draggingRef, startYRef]);

  const onTouchEnd = useCallback(() => {
    draggingRef.current = false;
    startYRef.current = null;
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    mainElement.addEventListener('touchstart', onTouchStart, { passive: true });
    mainElement.addEventListener('touchmove', onTouchMove, { passive: false });
    mainElement.addEventListener('touchend', onTouchEnd);

    return () => {
      mainElement.removeEventListener('touchstart', onTouchStart);
      mainElement.removeEventListener('touchmove', onTouchMove);
      mainElement.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};