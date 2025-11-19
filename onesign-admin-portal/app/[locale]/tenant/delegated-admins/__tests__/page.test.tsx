import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DelegatedAdminsPage from '../page';

// Mock tenant context and API
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

jest.mock('@/lib/api/users', () => ({
  getCurrentUserScope: jest.fn()
}));

describe('DelegatedAdminsPage', () => {
  const mockDelegatedAdmins = [
    {
      id: 'da-1',
      tenantUserId: 'user-1',
      userEmail: 'admin1@example.com',
      userDisplayName: 'Admin 1',
      orgUnitId: 'org-1',
      orgUnitName: 'Org 1',
      scopeType: 2,
      createdAt: '2024-01-01T10:00:00Z'
    }
  ];

  const mockOrgTree = [
    { id: 'org-1', name: 'Org 1', parentId: null, level: 0, status: 1, children: [] }
  ];

  const mockUsers = {
    items: [
      { id: 'user-1', email: 'admin1@example.com', isAdmin: true },
      { id: 'user-2', email: 'admin2@example.com', isAdmin: true }
    ]
  };

  const mockUserScope = {
    userId: 'user-1',
    isGlobalAdmin: true,
    rootOrgUnitIds: [],
    allowedOrgUnitIds: ['org-1']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getTenantId } = require('@/lib/tenant-context');
    const { getCurrentUserScope } = require('@/lib/api/users');

    getTenantId.mockReturnValue('tenant-123');
    getCurrentUserScope.mockResolvedValue(mockUserScope);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/delegated-admins') && !url.includes('POST') && !url.includes('DELETE')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDelegatedAdmins)
        });
      }
      if (url.includes('/org-units/tree')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOrgTree)
        });
      }
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockImplementation(() => new Promise(() => {}));

    render(<DelegatedAdminsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.title')).toBeInTheDocument();
    });
  });

  it('should display delegated admins in table', async () => {
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });
  });

  it('should render create button', async () => {
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });
  });

  it('should open create modal when clicking create button', async () => {
    const user = userEvent.setup();
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin'));

    expect(screen.getByText('tenant.delegatedAdmins.user')).toBeInTheDocument();
    expect(screen.getByText('tenant.delegatedAdmins.orgUnit')).toBeInTheDocument();
    expect(screen.getByText('tenant.delegatedAdmins.scopeType')).toBeInTheDocument();
  });

  it('should create delegated admin successfully', async () => {
    const user = userEvent.setup();
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'user-1');
    await user.selectOptions(selects[1], 'org-1');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delegated-admins'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('should handle creation error', async () => {
    const user = userEvent.setup();
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'user-1');
    await user.selectOptions(selects[1], 'org-1');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Creation failed' })
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });

  it('should delete delegated admin', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.delete'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delegated-admins/da-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should cancel deletion when not confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    });

    await user.click(screen.getByText('common.delete'));

    // Should not call delete endpoint
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything()
    );
  });

  it('should show access restricted for non-global admins', async () => {
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockResolvedValue({
      userId: 'user-1',
      isGlobalAdmin: false,
      rootOrgUnitIds: ['org-1'],
      allowedOrgUnitIds: ['org-1']
    });

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(screen.getByText('Only global administrators can manage delegated admins.')).toBeInTheDocument();
    });
  });

  it('should display scope type correctly', async () => {
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.orgAndDescendants')).toBeInTheDocument();
    });
  });

  it('should display scope type "OrgOnly" correctly', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/delegated-admins') && !url.includes('POST')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ ...mockDelegatedAdmins[0], scopeType: 1 }])
        });
      }
      if (url.includes('/org-units/tree')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOrgTree)
        });
      }
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.orgOnly')).toBeInTheDocument();
    });
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('00000000-0000-0000-0000-000000000000'),
        expect.anything()
      );
    });
  });

  it('should close modal on cancel', async () => {
    const user = userEvent.setup();
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin'));
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.delegatedAdmins.selectUser')).not.toBeInTheDocument();
    });
  });

  it('should handle network error during creation', async () => {
    const user = userEvent.setup();
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.delegatedAdmins.createDelegatedAdmin'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'user-1');
    await user.selectOptions(selects[1], 'org-1');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should handle delete error', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Delete failed' })
    });

    await user.click(screen.getByText('common.delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('should handle load data error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should display table headers correctly', async () => {
    render(<DelegatedAdminsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.delegatedAdmins.user')).toBeInTheDocument();
      expect(screen.getByText('tenant.delegatedAdmins.orgUnit')).toBeInTheDocument();
      expect(screen.getByText('tenant.delegatedAdmins.scopeType')).toBeInTheDocument();
      expect(screen.getByText('common.actions')).toBeInTheDocument();
    });
  });
});
