import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTenantsPage from '../page';

describe('AdminTenantsPage', () => {
  const mockTenants = [
    { id: '1', name: 'Tenant 1', slug: 'tenant-1', status: 'Active' },
    { id: '2', name: 'Tenant 2', slug: 'tenant-2', status: 'Suspended' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: mockTenants })
    });
  });

  it('should show loading state initially', () => {
    render(<AdminTenantsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render tenants table after loading', async () => {
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('Tenant 1')).toBeInTheDocument();
      expect(screen.getByText('Tenant 2')).toBeInTheDocument();
    });
  });

  it('should render page title', async () => {
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.title')).toBeInTheDocument();
    });
  });

  it('should render create tenant button', async () => {
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });
  });

  it('should open create modal when clicking create button', async () => {
    const user = userEvent.setup();
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });

    await user.click(screen.getByText('admin.tenants.createTenant'));

    expect(screen.getAllByText('admin.tenants.createTenant').length).toBeGreaterThan(1);
  });

  it('should handle tenant creation successfully', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '3', name: 'New Tenant', slug: 'new-tenant', status: 'Active' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [...mockTenants, { id: '3', name: 'New Tenant', slug: 'new-tenant', status: 'Active' }] })
      });

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });

    await user.click(screen.getByText('admin.tenants.createTenant'));

    const nameInput = screen.getByLabelText('admin.tenants.tenantName');
    const slugInput = screen.getByLabelText('admin.tenants.tenantSlug');

    await user.type(nameInput, 'New Tenant');
    await user.type(slugInput, 'new-tenant');
    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.tenantCreated')).toBeInTheDocument();
    });
  });

  it('should handle tenant creation error', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Tenant already exists' })
      });

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });

    await user.click(screen.getByText('admin.tenants.createTenant'));

    const nameInput = screen.getByLabelText('admin.tenants.tenantName');
    const slugInput = screen.getByLabelText('admin.tenants.tenantSlug');

    await user.type(nameInput, 'Duplicate Tenant');
    await user.type(slugInput, 'duplicate');
    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('Tenant already exists')).toBeInTheDocument();
    });
  });

  it('should close modal on cancel', async () => {
    const user = userEvent.setup();
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });

    await user.click(screen.getByText('admin.tenants.createTenant'));
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryAllByText('admin.tenants.createTenant').length).toBe(1);
    });
  });

  it('should handle status update', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      });

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('Tenant 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Suspended');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/admin/tenants/1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'Suspended' })
        })
      );
    });
  });

  it('should handle status update error', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Update failed' })
      });

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('Tenant 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Suspended');

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should handle network error during tenant creation', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.createTenant')).toBeInTheDocument();
    });

    await user.click(screen.getByText('admin.tenants.createTenant'));

    const nameInput = screen.getByLabelText('admin.tenants.tenantName');
    const slugInput = screen.getByLabelText('admin.tenants.tenantSlug');

    await user.type(nameInput, 'New Tenant');
    await user.type(slugInput, 'new-tenant');
    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle network error during status update', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockTenants })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('Tenant 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Suspended');

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should display table headers correctly', async () => {
    render(<AdminTenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin.tenants.tenantName')).toBeInTheDocument();
      expect(screen.getByText('admin.tenants.tenantSlug')).toBeInTheDocument();
      expect(screen.getByText('admin.tenants.status')).toBeInTheDocument();
      expect(screen.getByText('common.actions')).toBeInTheDocument();
    });
  });
});
