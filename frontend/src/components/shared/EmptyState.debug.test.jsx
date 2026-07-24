import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('EmptyState Debug - Different Click Methods', () => {
  test('test with fireEvent', () => {
    const handleClick = jest.fn();
    render(<EmptyState
      title="No Items"
      message="Add some items to get started."
      action={{ label: 'Get Started', onClick: handleClick, variant: 'btn-success' }}
    />);

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-success');

    // Click the button with fireEvent
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('test with userEvent', () => {
    const handleClick = jest.fn();
    render(<EmptyState
      title="No Items"
      message="Add some items to get started."
      action={{ label: 'Get Started', onClick: handleClick, variant: 'btn-success' }}
    />);

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-success');

    // Click the button with userEvent
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});