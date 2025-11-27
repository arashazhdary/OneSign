import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from '@/pages/admin/UsersPage';
import { usersApi } from '@/services/users.api';

vi.mock('@/services/users.api');

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'inactive' as const,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Admin',
    status: 'active' as const,
    createdAt: '2024-01-03',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Filter and Search Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter users by role', async () => {
    const adminUsers = mockUsers.filter((u) => u.role === 'Admin');

    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: mockUsers,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: adminUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    // Select Admin role
    const roleFilter = screen.getByLabelText(/role/i);
    fireEvent.change(roleFilter, { target: { value: 'Admin' } });

    // Apply filter
    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        role: 'Admin',
      });
    });
  });

  it('should filter users by status', async () => {
    const activeUsers = mockUsers.filter((u) => u.status === 'active');

    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: mockUsers,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: activeUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    // Select active status
    const statusFilter = screen.getByLabelText(/status/i);
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    // Apply filter
    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        status: 'active',
      });
    });
  });

  it('should combine search and filters', async () => {
    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: mockUsers,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.list).mockResolvedValueOnce({
      data: [mockUsers[0]],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Open filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    // Select Admin role
    const roleFilter = screen.getByLabelText(/role/i);
    fireEvent.change(roleFilter, { target: { value: 'Admin' } });

    // Apply filter
    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: 'John',
        role: 'Admin',
      });
    });
  });

  it('should clear filters', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open filter and apply
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    const roleFilter = screen.getByLabelText(/role/i);
    fireEvent.change(roleFilter, { target: { value: 'Admin' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear|reset/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('should debounce search input', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Type quickly
    fireEvent.change(searchInput, { target: { value: 'J' } });
    fireEvent.change(searchInput, { target: { value: 'Jo' } });
    fireEvent.change(searchInput, { target: { value: 'Joh' } });
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Should only call API once after debounce delay
    await waitFor(
      () => {
        const calls = vi.mocked(usersApi.list).mock.calls;
        const searchCalls = calls.filter((call) => call[0]?.search === 'John');
        expect(searchCalls.length).toBe(1);
      },
      { timeout: 1000 }
    );
  });

  it('should maintain filters across pagination', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 20,
      page: 1,
      pageSize: 10,
      totalPages: 2,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Apply filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    const roleFilter = screen.getByLabelText(/role/i);
    fireEvent.change(roleFilter, { target: { value: 'Admin' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        role: 'Admin',
      });
    });

    // Go to next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should maintain filter on page 2
    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        role: 'Admin',
      });
    });
  });
});
