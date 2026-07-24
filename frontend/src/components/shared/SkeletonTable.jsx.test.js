import { render, screen } from '@testing-library/react';
import SkeletonTable from './SkeletonTable';

describe('SkeletonTable', () => {
  test('Skeleton table renders with correct structure', () => {
    render(<SkeletonTable />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('skeleton-table');

    // Check header
    const headerCells = Array.from(table.querySelectorAll('th') || []);
    expect(headerCells).toHaveLength(6);

    // Check body rows
    const rows = Array.from(table.querySelectorAll('tbody tr') || []);
    expect(rows).toHaveLength(3); // default numRows is 3

    // Check first row has cells
    if (rows.length > 0) {
      const firstRowCells = Array.from(rows[0].querySelectorAll('td') || []);
      expect(firstRowCells).toHaveLength(6);
    }
  });

  test('Skeleton table accepts custom number of rows', () => {
    render(<SkeletonTable numRows={5} />);
    const rows = Array.from(screen.getByRole('table').querySelectorAll('tbody tr') || []);
    expect(rows).toHaveLength(5);
  });

  test('Skeleton table accepts custom columns', () => {
    const customColumns = [
      { label: 'Name', width: '30%' },
      { label: 'Email', width: '40%' },
      { label: 'Phone', width: '30%' }
    ];
    render(<SkeletonTable columns={customColumns} />);
    const headerCells = Array.from(screen.getByRole('table').querySelectorAll('th') || []);
    expect(headerCells).toHaveLength(3);

    expect(headerCells[0]).toHaveStyle('width: 30%');
    expect(headerCells[1]).toHaveStyle('width: 40%');
    expect(headerCells[2]).toHaveStyle('width: 30%');
  });

  test('Skeleton table accepts custom className', () => {
    render(<SkeletonTable className="custom-table" />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-table');
  });
});