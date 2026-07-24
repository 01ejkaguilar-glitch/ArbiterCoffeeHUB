import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Debug - Check Click Events', () => {
  test('test with console log in handler', () => {
    const handleRetry = jest.fn(() => {
      console.log('Retry handler called!');
    });
    const handleCancel = jest.fn(() => {
      console.log('Cancel handler called!');
    });

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

    console.log('About to click retry button');
    fireEvent.click(retryButton);
    console.log('Clicked retry button');

    console.log('About to click cancel button');
    fireEvent.click(cancelButton);
    console.log('Clicked cancel button');

    console.log('Retry handler called:', handleRetry.mock.calls.length, 'times');
    console.log('Cancel handler called:', handleCancel.mock.calls.length, 'times');

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});