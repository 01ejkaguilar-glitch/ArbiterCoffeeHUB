import { render, screen } from '@testing-library/react';
import Button from './Button';

test('Button has hover effect', () => {
  render(<Button>Test Button</Button>);
  const button = screen.getByRole('button');
  const hoverEffectWrapper = button.parentElement;

  // Initially should not have hover class
  expect(hoverEffectWrapper).not.toHaveClass('hover-effect');
  // Simulate hover
  button.dispatchEvent(new MouseEvent('mouseenter'));
  expect(hoverEffectWrapper).toHaveClass('hover-effect');
  // Simulate hover leave
  button.dispatchEvent(new MouseEvent('mouseleave'));
  expect(hoverEffectWrapper).not.toHaveClass('hover-effect');
});

test('Button renders with correct variant and size', () => {
  render(<Button variant="primary" size="lg">Test Button</Button>);
  const button = screen.getByRole('button', { name: /test button/i });
  expect(button).toBeInTheDocument();
  // Additional assertions for styling would go here
});