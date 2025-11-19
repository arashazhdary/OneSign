import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantUsersPage from '../page';

// Mock tenant context and API
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn(),
  setTenantId: jest.fn()
}));

jest.mock('@/lib/api/users', () => ({
  getCurrentUserScope: jest.fn()
}));

describe('TenantUsersPage', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      status: 'Active',
      isAdmin: true,
      lastLoginAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      status: 'Active',
      isAdmin: false,
      lastLoginAt: null
    }
  ];

  const mockOrgTree = [
    { id: 'org-1', name: 'Org 1', parentId: null, level: 0, status: 1, children: [] }
  ];

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
      if (url.includes('/users') && !url.includes('/org-units')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockUsers })
        });
      }
      if (url.includes('/org-units/tree')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOrgTree)
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

    render(<TenantUsersPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.title')).toBeInTheDocument();
    });
  });

  it('should display users in table', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('should render invite user button', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });
  });

  it('should open invite modal when clicking invite button', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));

    expect(screen.getByText('tenant.users.email')).toBeInTheDocument();
    expect(screen.getByText('tenant.users.isAdmin')).toBeInTheDocument();
  });

  it('should invite user successfully', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));

    const emailInput = screen.getByLabelText('tenant.users.email');
    await user.type(emailInput, 'newuser@example.com');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('tenant.users.userInvited')).toBeInTheDocument();
    });
  });

  it('should invite admin user', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));

    const emailInput = screen.getByLabelText('tenant.users.email');
    await user.type(emailInput, 'admin@example.com');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/invite'),
        expect.objectContaining({
          body: expect.stringContaining('"isAdmin":true')
        })
      );
    });
  });

  it('should handle invite error', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));

    const emailInput = screen.getByLabelText('tenant.users.email');
    await user.type(emailInput, 'existing@example.com');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'User already exists' })
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should disable user', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const disableButtons = screen.getAllByText('tenant.users.disable');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(disableButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.userDisabled')).toBeInTheDocument();
    });
  });

  it('should cancel disable when not confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const disableButtons = screen.getAllByText('tenant.users.disable');
    await user.click(disableButtons[0]);

    // Should not call the API
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/status'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('should assign org units to user', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByText('tenant.userOrgUnits.assignOrgUnits');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ primaryOrgUnitId: 'org-1', secondaryOrgUnitIds: [] })
    });

    await user.click(assignButtons[0]);

    expect(screen.getByText('tenant.userOrgUnits.primaryOrgUnit')).toBeInTheDocument();
  });

  it('should save org unit assignments', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByText('tenant.userOrgUnits.assignOrgUnits');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ primaryOrgUnitId: '', secondaryOrgUnitIds: [] })
    });

    await user.click(assignButtons[0]);

    // Select primary org unit
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'org-1');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('tenant.userOrgUnits.orgUnitsAssigned')).toBeInTheDocument();
    });
  });

  it('should handle org unit filter', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.title')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'org-1');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('orgUnitId=org-1')
      );
    });
  });

  it('should handle delegated admin scope', async () => {
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockResolvedValue({
      userId: 'user-1',
      isGlobalAdmin: false,
      rootOrgUnitIds: ['org-1'],
      allowedOrgUnitIds: ['org-1']
    });

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.title')).toBeInTheDocument();
    });

    // Should auto-select first rootOrgUnitId
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('org-1');
  });

  it('should display admin status correctly', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  it('should display last login date', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('2024-01-01T10:00:00Z')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('00000000-0000-0000-0000-000000000000')
      );
    });
  });

  it('should close invite modal on cancel', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByLabelText('tenant.users.email')).not.toBeInTheDocument();
    });
  });

  it('should close assign org units modal on cancel', async () => {
    const user = userEvent.setup();
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByText('tenant.userOrgUnits.assignOrgUnits');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ primaryOrgUnitId: '', secondaryOrgUnitIds: [] })
    });

    await user.click(assignButtons[0]);
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.userOrgUnits.primaryOrgUnit')).not.toBeInTheDocument();
    });
  });

  it('should handle network error during invite', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.inviteUser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.users.inviteUser'));

    const emailInput = screen.getByLabelText('tenant.users.email');
    await user.type(emailInput, 'newuser@example.com');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle disable user error', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const disableButtons = screen.getAllByText('tenant.users.disable');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(disableButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should not show disable button for already disabled users', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/users') && !url.includes('/org-units')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            items: [{ ...mockUsers[0], status: 'Disabled' }]
          })
        });
      }
      if (url.includes('/org-units/tree')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOrgTree)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.queryByText('tenant.users.disable')).not.toBeInTheDocument();
    });
  });

  it('should display table headers correctly', async () => {
    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.users.email')).toBeInTheDocument();
      expect(screen.getByText('tenant.users.status')).toBeInTheDocument();
      expect(screen.getByText('tenant.users.isAdmin')).toBeInTheDocument();
      expect(screen.getByText('tenant.users.lastLogin')).toBeInTheDocument();
      expect(screen.getByText('tenant.users.actions')).toBeInTheDocument();
    });
  });

  it('should handle org unit assignment error', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TenantUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByText('tenant.userOrgUnits.assignOrgUnits');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ primaryOrgUnitId: '', secondaryOrgUnitIds: [] })
    });

    await user.click(assignButtons[0]);

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'org-1');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
