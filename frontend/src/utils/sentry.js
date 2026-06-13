// src/utils/sentry.js
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Initialize Sentry
const initializeSentry = () => {
  // Only initialize in production to avoid sending dev errors
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN || '',
      integrations: [
        new Integrations.BrowserTracing(),
      ],
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
      environment: process.env.REACT_APP_ENVIRONMENT || 'production',
      release: process.env.REACT_APP_RELEASE_VERSION || '1.0.0',
      // Attach stacktrace to messages
      attachStacktrace: true,
      // Only send errors if we're online
      beforeSend: (event, hint) => {
        // Don't send error if navigator.onLine is false
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return null;
        }
        return event;
      },
    });
  }
};

// Capture an error with optional context
const captureError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    // In development, log to console
    console.error('Error captured:', error, context);
  }
};

// Capture a message with optional level and context
const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level, {
      extra: context
    });
  } else {
    // In development, log to console
    if (level === 'error' || level === 'fatal') {
      console.error('Message captured:', message, context);
    } else if (level === 'warn') {
      console.warn('Message captured:', message, context);
    } else {
      console.log('Message captured:', message, context);
    }
  }
};

// Set user context for error reporting
const setUserContext = (user) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(user);
  }
};

// Clear user context (e.g., on logout)
const clearUserContext = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
};

// Add breadcrumb for tracking user actions
const addBreadcrumb = (breadcrumb) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

export {
  initializeSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb
};