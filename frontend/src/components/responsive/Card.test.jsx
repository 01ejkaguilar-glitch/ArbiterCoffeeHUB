import { render, screen } from '@testing-library/react';
import ResponsiveCard from './Card';

test('renders card with header, body, and footer', () => {
  render(
    <ResponsiveCard>
      <ResponsiveCard.Header>Header</ResponsiveCard.Header>
      <ResponsiveCard.Body>Body</ResponsiveCard.Body>
      <ResponsiveCard.Footer>Footer</ResponsiveCard.Footer>
    </ResponsiveCard>
  );
  expect(screen.getByText(/header/i)).toBeInTheDocument();
  expect(screen.getByText(/body/i)).toBeInTheDocument();
  expect(screen.getByText(/footer/i)).toBeInTheDocument();
});