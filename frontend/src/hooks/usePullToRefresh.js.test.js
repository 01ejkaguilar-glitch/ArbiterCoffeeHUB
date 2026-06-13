import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from './usePullToRefresh';

describe('usePullToRefresh', () => {
  let callback;
  let originalQuerySelector;

  beforeEach(() => {
    callback = jest.fn();
    // Mock document.querySelector to return a main element
    const mainElement = document.createElement('div');
    mainElement.setAttribute('role', 'main');
    // Override document.querySelector to return our main element
    originalQuerySelector = document.querySelector;
    document.querySelector = (selector) => {
      if (selector === 'main') return mainElement;
      return originalQuerySelector.call(document, selector);
    };
    document.body.appendChild(mainElement);
  });

  afterEach(() => {
    // Restore original querySelector
    document.querySelector = originalQuerySelector;
    document.body.innerHTML = '';
  });

  test('Pull to refresh triggers callback on drag down', () => {
    const { result } = renderHook(() => usePullToRefresh(callback, { threshold: 50 }));

    // Wait for any pending effects to settle
    act(() => {});

    const { onTouchStart, onTouchMove, onTouchEnd } = result.current;

    // Simulate touch start
    act(() => {
      onTouchStart({ touches: [{ clientY: 100 }] });
    });

    // Simulate touch move past threshold
    act(() => {
      onTouchMove({ touches: [{ clientY: 200 }] }); // 100px diff > 50 threshold
    });

    // Simulate touch end
    act(() => {
      onTouchEnd();
    });

    expect(callback).toHaveBeenCalled();
  });

  test('Does not trigger callback when below threshold', () => {
    const { result } = renderHook(() => usePullToRefresh(callback, { threshold: 50 }));

    // Wait for any pending effects to settle
    act(() => {});

    const { onTouchStart, onTouchMove, onTouchEnd } = result.current;

    // Simulate touch start
    act(() => {
      onTouchStart({ touches: [{ clientY: 100 }] });
    });

    // Simulate touch move below threshold
    act(() => {
      onTouchMove({ touches: [{ clientY: 140 }] }); // 40px diff < 50 threshold
    });

    // Simulate touch end
    act(() => {
      onTouchEnd();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('Does not trigger when dragging up', () => {
    const { result } = renderHook(() => usePullToRefresh(callback, { threshold: 50 }));

    // Wait for any pending effects to settle
    act(() => {});

    const { onTouchStart, onTouchMove, onTouchEnd } = result.current;

    // Simulate touch start
    act(() => {
      onTouchStart({ touches: [{ clientY: 200 }] });
    });

    // Simulate touch move up (negative diff)
    act(() => {
      onTouchMove({ touches: [{ clientY: 100 }] }); // -100px diff
    });

    // Simulate touch end
    act(() => {
      onTouchEnd();
    });

    expect(callback).not.toHaveBeenCalled();
  });
});