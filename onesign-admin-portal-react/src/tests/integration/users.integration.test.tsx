import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from '@/pages/admin/UsersPage';
import { usersApi } from '@/services/users.api';

// Mock the API
vi.mock('@/services/users.api', () => ({
  usersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    export: vi.fn(),
  },
}));

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
    status: 'active' as const,
    createdAt: '2024-01-02',
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

describe('Users Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display users list', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(usersApi.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
  });

  it('should handle search functionality', async () => {
    const searchResults = [mockUsers[0]];

    vi.mocked(usersApi.list).mockResolvedValue({
      data: searchResults,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    render(<UsersPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: 'John',
      });
    });
  });

  it('should handle pagination', async () => {
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

    // Click next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
      });
    });
  });

  it('should create new user', async () => {
    const newUser = {
      id: '3',
      name: 'New User',
      email: 'new@example.com',
      role: 'User',
      status: 'active' as const,
      createdAt: '2024-01-03',
    };

    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.create).mockResolvedValue(newUser);

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open add user modal
    const addButton = screen.getByRole('button', { name: /add.*user/i });
    fireEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const roleSelect = screen.getByLabelText(/role/i);

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'User' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usersApi.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        role: 'User',
      });
    });
  });

  it('should delete user', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.delete).mockResolvedValue();

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm|yes/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(usersApi.delete).toHaveBeenCalledWith('1');
    });
  });

  it('should handle bulk delete', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    vi.mocked(usersApi.bulkDelete).mockResolvedValue();

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select users
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first user
    fireEvent.click(checkboxes[1]); // Select second user

    // Click bulk delete
    const bulkActionButton = screen.getByRole('button', { name: /bulk.*action/i });
    fireEvent.click(bulkActionButton);

    const deleteOption = screen.getByText(/delete selected/i);
    fireEvent.click(deleteOption);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(usersApi.bulkDelete).toHaveBeenCalledWith(['1', '2']);
    });
  });

  it('should export users data', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    // Select format
    const pdfOption = screen.getByText(/pdf/i);
    fireEvent.click(pdfOption);

    await waitFor(() => {
      expect(usersApi.export).toHaveBeenCalledWith('pdf');
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(usersApi.list).mockRejectedValue(new Error('Failed to load users'));

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });
});
