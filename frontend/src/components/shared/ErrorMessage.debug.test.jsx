import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Debug', () => {
  test('debug button clicks', () => {
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

    // Debug: see what elements we have
    console.log('Document body:', document.body.innerHTML);

    // Find all buttons
    const buttons = screen.getAllByRole('button');
    console.log('Number of buttons found:', buttons.length);
    buttons.forEach((button, index) => {
      console.log(`Button ${index}:`, button.outerHTML);
      console.log(`Button ${index} text content:`, button.textContent.trim());
    });

    // Try to find by text content
    const retryButton = screen.getByText(/retry/i);
    const cancelButton = screen.getByText(/cancel/i);
    console.log('Retry button found:', !!retryButton);
    console.log('Cancel button found:', !!cancelButton);

    // Try clicking
    console.log('Clicking retry button...');
    fireEvent.click(retryButton);
    console.log('Retry handler called:', handleRetry.mock.calls.length, 'times');

    console.log('Clicking cancel button...');
    fireEvent.click(cancelButton);
    console.log('Cancel handler called:', handleCancel.mock.calls.length, 'times');

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});