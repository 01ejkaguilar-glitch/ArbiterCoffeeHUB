// src/components/common/SentryTest.js
// This component is for testing Sentry integration - should not be used in production
import React from 'react';
import { useSentry } from '@/hooks/useSentry';

const SentryTest = () => {
  const { reportError, reportMessage, leaveBreadcrumb } = useSentry();

  const testError = () => {
    try {
      throw new Error('This is a test error for Sentry');
    } catch (error) {
      reportError(error, { test: true, source: 'SentryTest component' });
    }
  };

  const testMessage = () => {
    reportMessage('This is a test message for Sentry', 'info', {
      test: true,
      source: 'SentryTest component'
    });
  };

  const testBreadcrumb = () => {
    leaveBreadcrumb({
      type: 'user',
      category: 'test',
      message: 'Test breadcrumb from SentryTest component'
    });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px' }}>
      <h3>Sentry Test Component</h3>
      <p>This component is for testing Sentry integration. It should not be rendered in production.</p>
      <button onClick={testError} style={{ margin: '5px' }}>
        Test Error Report
      </button>
      <button onClick={testMessage} style={{ margin: '5px' }}>
        Test Message Report
      </button>
      <button onClick={testBreadcrumb} style={{ margin: '5px' }}>
        Test Breadcrumb
      </button>
    </div>
  );
};

export default SentryTest;