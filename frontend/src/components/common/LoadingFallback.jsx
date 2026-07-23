import React from 'react';
import { Spinner, Container } from 'react-bootstrap';
import RefreshIndicator from '../shared/RefreshIndicator';
import SkeletonCard from '../shared/SkeletonCard';
import SkeletonLayout from '../shared/SkeletonLayout';

/**
 * Loading fallback component for lazy-loaded routes
 * Shows a centered spinner with skeleton screen effect
 * Can also show progress indicator for async operations
 */
const LoadingFallback = ({
  fullScreen = true,
  message = 'Loading...',
  progress = null,  // null means show spinner, 0-1 means show progress indicator
  skeleton = false  // when true, shows skeleton screens instead of loading indicators
}) => {
  // If skeleton is true, show skeleton screens
  if (skeleton) {
    if (fullScreen) {
      return (
        <Container className="d-flex justify-content-center align-items-center min-h-70vh">
          <div className="text-center">
            <SkeletonLayout
              skeletonComponent={SkeletonCard}
              skeletonProps={{ titleWidth: '50%', subtitleWidth: '70%', footerWidth: '30%' }}
            />
          </div>
        </Container>
      );
    }

    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <SkeletonLayout
          skeletonComponent={SkeletonCard}
          skeletonProps={{ titleWidth: '50%', subtitleWidth: '70%', footerWidth: '30%' }}
        />
      </div>
    );
  }

  // If progress is specified, show the refresh indicator
  if (progress !== null) {
    if (fullScreen) {
      return (
        <Container className="d-flex justify-content-center align-items-center min-h-70vh">
          <div className="text-center">
            <RefreshIndicator progress={progress} message={message} />
          </div>
        </Container>
      );
    }

    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <RefreshIndicator progress={progress} message={message} />
      </div>
    );
  }

  // Otherwise show the traditional spinner
  if (fullScreen) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-h-70vh">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" className="spinner-lg">
            <span className="visually-hidden">{message}</span>
          </Spinner>
          <p className="mt-3 text-muted">{message}</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default LoadingFallback;
