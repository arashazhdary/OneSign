import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '@/components/common/DataTable';

describe('DataTable Component', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ];

  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} emptyMessage="No data found" />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const handleClick = vi.fn();
    render(<DataTable data={mockData} columns={mockColumns} onRowClick={handleClick} />);

    const firstRow = screen.getByText('John Doe').closest('tr');
    if (firstRow) fireEvent.click(firstRow);

    expect(handleClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('filters data based on search', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('paginates data correctly', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: 'User',
    }));

    render(<DataTable data={largeData} columns={mockColumns} pageSize={10} />);

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();
  });

  it('sorts data when column header is clicked', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob Johnson');
  });
});
