// src/hooks/useSentry.js
import { useCallback } from 'react';
import { captureError, captureMessage, addBreadcrumb } from '../utils/sentry';

// Custom hook for easy Sentry integration in components
export const useSentry = () => {
  // Report an error to Sentry
  const reportError = useCallback((error, context = {}) => {
    captureError(error, context);
  }, []);

  // Report a message to Sentry
  const reportMessage = useCallback((message, level = 'info', context = {}) => {
    captureMessage(message, level, context);
  }, []);

  // Add a breadcrumb for tracking user actions
  const leaveBreadcrumb = useCallback((breadcrumb) => {
    addBreadcrumb(breadcrumb);
  }, []);

  return {
    reportError,
    reportMessage,
    leaveBreadcrumb
  };
};

export default useSentry;