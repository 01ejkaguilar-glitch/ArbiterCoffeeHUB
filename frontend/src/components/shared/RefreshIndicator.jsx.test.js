import { render, screen } from '@testing-library/react';
import RefreshIndicator from './RefreshIndicator';

test('Refresh indicator shows progress based on progress prop', () => {
  render(<RefreshIndicator progress={0.5} />);
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toHaveAttribute('aria-valuenow', '50');
});

test('Refresh indicator shows 0% when progress is 0', () => {
  render(<RefreshIndicator progress={0} />);
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toHaveAttribute('aria-valuenow', '0');
});

test('Refresh indicator shows 100% when progress is 1', () => {
  render(<RefreshIndicator progress={1} />);
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toHaveAttribute('aria-valuenow', '100');
});

test('Refresh indicator displays custom message', () => {
  render(<RefreshIndicator progress={0.7} message="Loading data..." />);
  const progressText = screen.getByText(/loading data\.\.\. 70%/i);
  expect(progressText).toBeInTheDocument();
});