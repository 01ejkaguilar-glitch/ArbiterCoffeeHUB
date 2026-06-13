import { render, screen } from '@testing-library/react';
import LoadingFallback from './LoadingFallback';

describe('LoadingFallback', () => {
  test('renders spinner when progress is null', () => {
    render(<LoadingFallback />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();

    const message = screen.getByText(/loading.../i, { selector: 'p' });
    expect(message).toBeInTheDocument();
  });

  test('renders refresh indicator when progress is provided', () => {
    const progressValue = 0.5;
    render(<LoadingFallback progress={progressValue} message="Testing..." />);

    // Should have progress bar role
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    // Should show the message with percentage
    const messageText = screen.getByText(/testing\.\.\. 50%/i);
    expect(messageText).toBeInTheDocument();
  });

  test('renders refresh indicator at 0% when progress is 0', () => {
    render(<LoadingFallback progress={0} message="Starting..." />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    const messageText = screen.getByText(/starting\.\.\. 0%/i);
    expect(messageText).toBeInTheDocument();
  });

  test('renders refresh indicator at 100% when progress is 1', () => {
    render(<LoadingFallback progress={1} message="Complete..." />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');

    const messageText = screen.getByText(/complete\.\.\. 100%/i);
    expect(messageText).toBeInTheDocument();
  });

  test('renders fullscreen version when fullScreen=true', () => {
    render(<LoadingFallback fullScreen message="Fullscreen loading..." />);

    // Should have min-h-70vh class for fullscreen
    const textElement = screen.getByText(/fullscreen loading\.\.\./i, { selector: 'p' });
    const container = textElement.parentElement.parentElement;
    expect(container).toHaveClass('min-h-70vh');
  });

  test('renders compact version when fullScreen=false', () => {
    render(<LoadingFallback fullScreen={false} message="Compact loading..." />);

    // Should not have the large container styling
    const content = screen.getByText(/compact loading\.\.\./i, { selector: 'p' });
    // The compact version should be in a div with p-4 padding
    expect(content).toBeInTheDocument();
  });

  test('renders skeleton screens when skeleton=true', () => {
    render(<LoadingFallback skeleton={true} />);

    // Should show skeleton card instead of spinner
    const skeletonCard = screen.getByRole('region', { name: /card/i });
    expect(skeletonCard).toHaveClass('skeleton-card');
    expect(skeletonCard).toHaveStyle('height: 120px');

    // Should not show spinner
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('renders skeleton screens in fullscreen mode when skeleton=true', () => {
    render(<LoadingFallback fullScreen={true} skeleton={true} />);

    // Should show skeleton card in fullscreen container
    const skeletonCard = screen.getByRole('region', { name: /card/i });
    expect(skeletonCard).toHaveClass('skeleton-card');

    // Should be in container with min-h-70vh class
    const container = skeletonCard.parentElement.parentElement.parentElement;
    expect(container).toHaveClass('min-h-70vh');
  });
});