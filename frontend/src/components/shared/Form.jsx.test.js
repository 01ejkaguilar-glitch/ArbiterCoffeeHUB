import { render, screen } from '@testing-library/react';
import Form from './Form';

test('Form has hover effect', () => {
  render(<Form><input type="text" /></Form>);
  const form = screen.getByRole('form');
  // Initially should not have hover class
  expect(form).not.toHaveClass('hover-effect');
  // Simulate hover
  form.dispatchEvent(new MouseEvent('mouseenter'));
  expect(form).toHaveClass('hover-effect');
  // Simulate hover leave
  form.dispatchEvent(new MouseEvent('mouseleave'));
  expect(form).not.toHaveClass('hover-effect');
});

test('Form calls onSubmit when submitted', () => {
  const handleSubmit = jest.fn();
  render(<Form onSubmit={handleSubmit}>
    <input type="text" />
    <button type="submit">Submit</button>
  </Form>);

  const button = screen.getByRole('button', { name: /submit/i });
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
});