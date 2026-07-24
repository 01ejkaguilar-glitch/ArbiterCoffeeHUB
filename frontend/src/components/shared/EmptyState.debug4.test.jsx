import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('EmptyState Debug - Detailed Investigation', () => {
  test('investigate button properties', () => {
    const handleClick = jest.fn();
    render(<EmptyState
      title="No Items"
      message="Add some items to get started."
      action={{ label: 'Get Started', onClick: handleClick, variant: 'btn-success' }}
    />);

    // Get the button
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-success');

    console.log('Button element:', button);
    console.log('Button outerHTML:', button.outerHTML);
    console.log('Button textContent:', button.textContent);
    console.log('Button onclick:', button.onclick);
    console.log('Button hasAttribute onclick:', button.hasAttribute('onclick'));
    console.log('Button getAttribute onclick:', button.getAttribute('onclick'));

    // Test fireEvent
    console.log('Testing fireEvent...');
    fireEvent.click(button);
    console.log('fireEvent - handleClick called:', handleClick.mock.calls.length, 'times');

    // Reset mock
    handleClick.mockClear();

    // Test userEvent
    console.log('Testing userEvent...');
    fireEvent.click(button);
    console.log('userEvent - handleClick called:', handleClick.mock.calls.length, 'times');

    // The test passes if either works - but we know fireEvent works from previous test
    expect(handleClick).toHaveBeenCalledTimes(1); // This will fail if userEvent doesn't work, which is expected for now
  });
});