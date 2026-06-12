import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  test('renders error message with icon', () => {
    render(<ErrorMessage
      type="error"
      message="Something went wrong"
    />);

    // Should show error icon
    expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument();

    // Should show error message
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('renders warning message with icon', () => {
    render(<ErrorMessage
      type="warning"
      message="This is a warning"
    />);

    // Should show warning icon
    expect(screen.getByRole('img', { name: /warning/i })).toBeInTheDocument();

    // Should show warning message
    expect(screen.getByText(/this is a warning/i)).toBeInTheDocument();
  });

  test('renders info message with icon', () => {
    render(<ErrorMessage
      type="info"
      message="Just some information"
    />);

    // Should show info icon
    expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();

    // Should show info message
    expect(screen.getByText(/just some information/i)).toBeInTheDocument();
  });

  test('renders success message with icon', () => {
    render(<ErrorMessage
      type="success"
      message="Operation completed successfully"
    />);

    // Should show success icon
    expect(screen.getByRole('img', { name: /success/i })).toBeInTheDocument();

    // Should show success message
    expect(screen.getByText(/operation completed successfully/i)).toBeInTheDocument();
  });

  test('defaults to error type when not specified', () => {
    render(<ErrorMessage
      message="Default error message"
    />);

    // Should show error icon (default)
    expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument();

    // Should show message
    expect(screen.getByText(/default error message/i)).toBeInTheDocument();
  });

  test('renders suggested actions when provided', () => {
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

    // Should show action buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(/retry/i);
    expect(buttons[1]).toHaveTextContent(/cancel/i);

    // Clicking buttons should call the provided handlers
    userEvent.click(buttons[0]);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    userEvent.click(buttons[1]);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test('does not show actions section when no actions provided', () => {
    render(<ErrorMessage
      type="error"
      message="Just an error message"
    />);

    // Should not show actions container
    const actionsContainer = document.querySelector('.error-message-actions');
    expect(actionsContainer).toBeNull();
  });
});