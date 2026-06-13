import { render, screen } from '@testing-library/react';
import Card from './Card';

test('Card has hover effect', () => {
  render(<Card>Test Card</Card>);
  const card = screen.getByRole('region');
  // Initially should not have hover class
  expect(card).not.toHaveClass('hover-effect');
  // Simulate hover
  card.dispatchEvent(new MouseEvent('mouseenter'));
  expect(card).toHaveClass('hover-effect');
  // Simulate hover leave
  card.dispatchEvent(new MouseEvent('mouseleave'));
  expect(card).not.toHaveClass('hover-effect');
});

test('Card renders with title and subtitle', () => {
  render(<Card title="Test Title" subtitle="Test Subtitle">Test Content</Card>);
  expect(screen.getByText(/test title/i)).toBeInTheDocument();
  expect(screen.getByText(/test subtitle/i)).toBeInTheDocument();
  expect(screen.getByText(/test content/i)).toBeInTheDocument();
});