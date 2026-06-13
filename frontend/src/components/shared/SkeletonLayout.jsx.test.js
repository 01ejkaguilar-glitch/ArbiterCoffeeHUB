import { render, screen } from '@testing-library/react';
import SkeletonLayout from './SkeletonLayout';
import SkeletonCard from './SkeletonCard';

describe('SkeletonLayout', () => {
  test('renders children when no skeleton component provided', () => {
    const testContent = <div>Test Content</div>;
    render(<SkeletonLayout>{testContent}</SkeletonLayout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders skeleton component when provided', () => {
    render(<SkeletonLayout skeletonComponent={SkeletonCard} />);
    const skeletonCard = screen.getByRole('region');
    expect(skeletonCard).toHaveClass('skeleton-card');
  });

  test('passes props to skeleton component', () => {
    render(<SkeletonLayout
      skeletonComponent={SkeletonCard}
      skeletonProps={{ titleWidth: '80%' }}
    />);
    const skeletonElement = screen.getByRole('region').firstChild;
    expect(skeletonElement).toHaveStyle('width: 80%');
  });

  test('accepts custom className', () => {
    render(<SkeletonLayout className="custom-layout" />);
    const containerElement = document.querySelector('.custom-layout');
    expect(containerElement).toHaveClass('custom-layout');
  });

  test('renders multiple skeleton items when children is array', () => {
    const items = ['item1', 'item2', 'item3'];
    render(<SkeletonLayout
      skeletonComponent={SkeletonCard}
    >
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </SkeletonLayout>);

    const skeletonCards = screen.getAllByRole('region');
    expect(skeletonCards).toHaveLength(3);
  });
});