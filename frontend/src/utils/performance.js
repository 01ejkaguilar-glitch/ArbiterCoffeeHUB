// src/utils/performance.js
import { useCallback } from 'react';
import { addBreadcrumb } from './sentry';

// Custom performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  // Mark a point in time
  mark = (name) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(name);
        this.marks.set(name, performance.now());

        // Add breadcrumb for significant marks
        if (process.env.NODE_ENV === 'production') {
          addBreadcrumb({
            type: 'custom',
            category: 'performance',
            message: `Mark: ${name}`,
            data: { timestamp: performance.now() }
          });
        }
      } catch (e) {
        // Ignore mark errors
      }
    }
  };

  // Measure time between two marks
  measure = (name, startMark, endMark) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        if (typeof startMark === 'string') {
          startMark = this.marks.get(startMark) || performance.now();
        }
        if (typeof endMark === 'string') {
          endMark = this.marks.get(endMark) || performance.now();
        }

        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure').pop();

        if (measure) {
          this.measures.set(name, measure);

          // Report to Sentry
          if (process.env.NODE_ENV === 'production') {
            import('@sentry/react').then(({ captureMessage }) => {
              captureMessage(`Performance Measure: ${name}`, 'info', {
                metric: 'performance_measure',
                name: name,
                duration: measure.duration.toFixed(2),
                startTime: measure.startTime.toFixed(2),
                // Add context
                url: window.location.href
              });
            }).catch(err => {
              console.warn('Failed to send performance measure to Sentry:', err);
            });
          }
        }

        return measure;
      } catch (e) {
        // Ignore measure errors
      }
    }
    return null;
  };

  // Get a measure by name
  getMeasure = (name) => {
    return this.measures.get(name);
  };

  // Clear marks
  clearMarks = (name) => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      if (name) {
        performance.clearMarks(name);
        this.marks.delete(name);
      } else {
        performance.clearMarks();
        this.marks.clear();
      }
    }
  };

  // Clear measures
  clearMeasures = (name) => {
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      if (name) {
        performance.clearMeasures(name);
        this.measures.delete(name);
      } else {
        performance.clearMeasures();
        this.measures.clear();
      }
    }
  };

  // Clear all marks and measures
  clear = () => {
    this.clearMarks();
    this.clearMeasures();
  };
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

// Custom hook for using performance monitoring in components
export const usePerformance = () => {
  const mark = useCallback((name) => {
    performanceMonitor.mark(name);
  }, []);

  const measure = useCallback((name, startMark, endMark) => {
    return performanceMonitor.measure(name, startMark, endMark);
  }, []);

  return {
    mark,
    measure,
    ...performanceMonitor
  };
};

export default PerformanceMonitor;
export { usePerformance };