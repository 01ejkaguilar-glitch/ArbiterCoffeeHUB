import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveTable from './Table';

describe('ResponsiveTable', () => {
  test('renders table with headers and rows', () => {
    const columns = [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Age', accessor: 'age' }
    ];
    const data = [
      { name: 'John Doe', email: 'john@example.com', age: 30 },
      { name: 'Jane Smith', email: 'jane@example.com', age: 25 }
    ];

    render(<ResponsiveTable columns={columns} data={data} />);

    // Check headers
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/age/i)).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/30/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/25/i)).toBeInTheDocument();
  });

  test('shows loading state when loading prop is true', () => {
    const columns = [{ Header: 'Name', accessor: 'name' }];
    const data = [];

    render(<ResponsiveTable columns={columns} data={data} loading />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows empty state when no data provided', () => {
    const columns = [{ Header: 'Name', accessor: 'name' }];
    const data = [];

    render(<ResponsiveTable columns={columns} data={data} emptyMessage="No records found" />);

    expect(screen.getByText(/no records found/i)).toBeInTheDocument();
  });

  test('handles null/undefined values in data', () => {
    const columns = [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' }
    ];
    const data = [
      { name: 'John Doe', email: null },
      { name: undefined, email: 'jane@example.com' }
    ];

    render(<ResponsiveTable columns={columns} data={data} />);

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    // Get all cells and check specific indices
    const cells = screen.getAllByRole('cell');
    expect(cells[1]).toHaveTextContent(''); // null email (second cell in first row)
    expect(cells[2]).toHaveTextContent(''); // undefined name (first cell in second row)
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
  });
});