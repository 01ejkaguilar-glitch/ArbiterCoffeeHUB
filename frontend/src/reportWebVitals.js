const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const sendToSentry = (metricName, value) => {
        // Only send to Sentry in production
        if (process.env.NODE_ENV === 'production') {
          // Import Sentry dynamically to avoid issues in environments where it's not available
          import('@sentry/react').then(({ captureMessage }) => {
            captureMessage(`Web Vital: ${metricName}`, 'info', {
              metric: metricName,
              value: value.toFixed(2),
              // Add some basic context
              url: window.location.href,
              userAgent: navigator.userAgent
            });
          }).catch(err => {
            // Silently fail if Sentry is not available
            console.warn('Failed to send web vital to Sentry:', err);
          });
        }
      };

      getCLS((cls) => {
        onPerfEntry(cls);
        sendToSentry('CLS', cls);
      });
      getFID((fid) => {
        onPerfEntry(fid);
        sendToSentry('FID', fid);
      });
      getFCP((fcp) => {
        onPerfEntry(fcp);
        sendToSentry('FCP', fcp);
      });
      getLCP((lcp) => {
        onPerfEntry(lcp);
        sendToSentry('LCP', lcp);
      });
      getTTFB((ttfb) => {
        onPerfEntry(ttfb);
        sendToSentry('TTFB', ttfb);
      });
    });
  }
};

export default reportWebVitals;
