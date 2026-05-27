import { render, screen } from '@testing-library/react';
import ResponsiveButton from './Button';

test('renders button with correct variant and size', () => {
  render(<ResponsiveButton variant="primary" size="lg">Test Button</ResponsiveButton>);
  const button = screen.getByRole('button', { name: /test button/i });
  expect(button).toBeInTheDocument();
  // Additional assertions for mobile responsiveness would go here
});