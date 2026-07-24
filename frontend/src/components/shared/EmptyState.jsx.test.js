import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  test('Empty state displays illustration and message', () => {
    render(<EmptyState
      illustration="orders"
      title="No Orders"
      message="You don't have any orders yet."
    />);

    expect(screen.getByText(/no orders/i)).toBeInTheDocument();
    expect(screen.getByText(/you don't have any orders yet/i)).toBeInTheDocument();

    // Check that illustration is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('Empty state displays custom title and message', () => {
    render(<EmptyState
      title="Custom Title"
      message="Custom Message"
    />);

    expect(screen.getByText(/custom title/i)).toBeInTheDocument();
    expect(screen.getByText(/custom message/i)).toBeInTheDocument();
  });

  test('Empty state displays action button', () => {
    const handleClick = jest.fn();
    render(<EmptyState
      title="No Items"
      message="Add some items to get started."
      action={{ label: 'Get Started', onClick: handleClick, variant: 'btn-success' }}
    />);

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-success');

    // Click the button
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Empty state displays string action button', () => {
    render(<EmptyState
      title="No Data"
      message="Click to load data."
      action="Load Data"
    />);

    const button = screen.getByRole('button', { name: /load data/i });
    expect(button).toBeInTheDocument();
  });

  test('Empty state accepts custom className', () => {
    render(<EmptyState
      title="Test"
      message="Test Message"
      className="custom-empty-state"
    />);

    const emptyStateElement = document.querySelector('.custom-empty-state');
    expect(emptyStateElement).toBeInTheDocument();
  });
});