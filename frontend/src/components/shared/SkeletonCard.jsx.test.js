import { render, screen } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  test('Skeleton card renders with correct dimensions', () => {
    render(<SkeletonCard />);
    const card = screen.getByRole('region');
    expect(card).toHaveClass('skeleton-card');
    expect(card).toHaveStyle('height: 120px');
  });

  test('Skeleton card accepts custom width props', () => {
    render(<SkeletonCard titleWidth="80%" subtitleWidth="90%" footerWidth="50%" />);
    const titleElement = screen.getByRole('region').firstChild;
    const subtitleElement = titleElement.nextSibling;
    const footerElement = subtitleElement.nextSibling;

    expect(titleElement).toHaveStyle('width: 80%');
    expect(subtitleElement).toHaveStyle('width: 90%');
    expect(footerElement).toHaveStyle('width: 50%');
  });

  test('Skeleton card accepts custom className', () => {
    render(<SkeletonCard className="custom-skeleton" />);
    const card = screen.getByRole('region');
    expect(card).toHaveClass('custom-skeleton');
  });
});