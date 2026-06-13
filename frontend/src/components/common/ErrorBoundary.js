// src/components/common/ErrorBoundary.js
import React, { Component } from 'react';
import { captureError } from '../../utils/sentry';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      ...this.props.context
    });

    // Update state so the fallback UI is shown
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallbackUI ? (
        this.props.fallbackUI(this.props.error, this.props.resetErrorBoundary)
      ) : (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => this.props.resetErrorBoundary && this.props.resetErrorBoundary()}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Helper component to reset error boundary state
export const ErrorBoundaryReset = ({ children }) => {
  const [resetKey, setResetKey] = React.useState(0);

  const resetErrorBoundary = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <>
      {children}
      {/* This component will reset when resetKey changes */}
      <ErrorBoundary.NullView key={resetKey} resetErrorBoundary={resetErrorBoundary} />
    </>
  );
};

// Add a null view to ErrorBoundary so we can reset it
ErrorBoundary.NullView = () => null;