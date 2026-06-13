// src/utils/featureTracking.js
import { useCallback } from 'react';
import { addBreadcrumb } from './sentry';

// Feature tracking utility
class FeatureTracker {
  constructor() {
    this.featureUsage = new Map();
    this.initialized = false;
  }

  // Initialize feature tracking
  initialize = () => {
    if (this.initialized) return;
    this.initialized = true;

    // Track page load as a feature
    this.trackFeature('app_load', {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  // Track a feature usage
  trackFeature = (featureName, properties = {}) => {
    // Don't track in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' &&
        !process.env.REACT_APP_ENABLE_FEATURE_TRACKING) {
      return;
    }

    // Increment usage count
    const currentCount = this.featureUsage.get(featureName) || 0;
    this.featureUsage.set(featureName, currentCount + 1);

    const featureData = {
      feature: featureName,
      count: this.featureUsage.get(featureName),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...properties
    };

    // Send to analytics endpoint or Sentry
    if (process.env.NODE_ENV === 'production') {
      // Try to send to Sentry as a custom event
      try {
        import('@sentry/react').then(({ captureMessage }) => {
          captureMessage(`Feature Usage: ${featureName}`, 'info', {
            metric: 'feature_usage',
            feature: featureName,
            count: this.featureUsage.get(featureName),
            ...properties
          });
        }).catch(err => {
          // Fallback to breadcrumb if Sentry fails
          addBreadcrumb({
            type: 'custom',
            category: 'feature_usage',
            message: `Feature: ${featureName}`,
            data: featureData
          });
        });
      } catch (e) {
        // Fallback to breadcrumb
        addBreadcrumb({
          type: 'custom',
          category: 'feature_usage',
          message: `Feature: ${featureName}`,
          data: featureData
        });
      }
    } else {
      // Log in development
      console.log('[Feature Tracking]', featureData);
    }
  };

  // Get usage count for a feature
  getFeatureCount = (featureName) => {
    return this.featureUsage.get(featureName) || 0;
  };

  // Get all feature usage
  getAllFeatureUsage = () => {
    return Object.fromEntries(this.featureUsage);
  };

  // Reset tracking (useful for testing)
  reset = () => {
    this.featureUsage.clear();
    this.initialize();
  };
}

// Create a singleton instance
const featureTracker = new FeatureTracker();

// Initialize on first load
if (typeof window !== 'undefined') {
  featureTracker.initialize();
}

// Custom hook for using feature tracking in components
export const useFeatureTracking = () => {
  const trackFeature = useCallback((featureName, properties = {}) => {
    featureTracker.trackFeature(featureName, properties);
  }, []);

  const getFeatureCount = useCallback((featureName) => {
    return featureTracker.getFeatureCount(featureName);
  }, []);

  return {
    trackFeature,
    getFeatureCount,
    ...featureTracker
  };
};

export default featureTracker;
export { useFeatureTracking };