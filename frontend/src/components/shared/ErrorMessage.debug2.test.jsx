import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Debug - Different Click Methods', () => {
  test('test with fireEvent', () => {
    const handleRetry = jest.fn();
    const handleCancel = jest.fn();

    const actions = [
      { label: 'Retry', onClick: handleRetry },
      { label: 'Cancel', variant: 'secondary', onClick: handleCancel }
    ];

    render(<ErrorMessage
      type="error"
      message="Network error occurred"
      actions={actions}
    />);

    // Get buttons by text
    const retryButton = screen.getByText(/retry/i);
    const cancelButton = screen.getByText(/cancel/i);

    // Try fireEvent
    fireEvent.click(retryButton);
    fireEvent.click(cancelButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test('test with userEvent', () => {
    const handleRetry = jest.fn();
    const handleCancel = jest.fn();

    const actions = [
      { label: 'Retry', onClick: handleRetry },
      { label: 'Cancel', variant: 'secondary', onClick: handleCancel }
    ];

    render(<ErrorMessage
      type="error"
      message="Network error occurred"
      actions={actions}
    />);

    // Get buttons by text
    const retryButton = screen.getByText(/retry/i);
    const cancelButton = screen.getByText(/cancel/i);

    // Try userEvent
    fireEvent.click(retryButton);
    fireEvent.click(cancelButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});