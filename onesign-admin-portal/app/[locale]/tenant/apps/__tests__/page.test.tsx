import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantAppsPage from '../page';

// Mock tenant context and API
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

jest.mock('@/lib/api/users', () => ({
  getCurrentUserScope: jest.fn()
}));

describe('TenantAppsPage', () => {
  const mockApplications = [
    {
      id: 'app-1',
      name: 'App 1',
      clientId: 'client-1',
      applicationType: 'Web',
      redirectUris: [{ id: 'uri-1', uri: 'https://app1.com/callback' }]
    },
    {
      id: 'app-2',
      name: 'App 2',
      clientId: 'client-2',
      applicationType: 'Mobile',
      redirectUris: []
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
      if (url.includes('/applications') && !url.includes('/org-units') && !url.includes('/redirect-uris')) {
        if (url.includes('/app-')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ redirectUris: mockApplications[0].redirectUris })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockApplications })
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

    render(<TenantAppsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.title')).toBeInTheDocument();
    });
  });

  it('should display applications in table', async () => {
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
      expect(screen.getByText('App 2')).toBeInTheDocument();
    });
  });

  it('should render create application button', async () => {
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });
  });

  it('should open create modal when clicking create button', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.applications.createApplication'));

    expect(screen.getByText('tenant.applications.applicationName')).toBeInTheDocument();
    expect(screen.getByText('tenant.applications.applicationType')).toBeInTheDocument();
  });

  it('should handle application creation', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.applications.createApplication'));

    const nameInput = screen.getByLabelText('tenant.applications.applicationName');
    await user.type(nameInput, 'New App');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'app-3', name: 'New App' })
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.applicationCreated')).toBeInTheDocument();
    });
  });

  it('should handle application creation error', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.applications.createApplication'));

    const nameInput = screen.getByLabelText('tenant.applications.applicationName');
    await user.type(nameInput, 'New App');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Creation failed' })
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });

  it('should open edit modal when clicking edit', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);

    expect(screen.getByText('tenant.applications.editApplication')).toBeInTheDocument();
  });

  it('should handle application update', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.applicationUpdated')).toBeInTheDocument();
    });
  });

  it('should handle application deletion', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('common.delete');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.applicationDeleted')).toBeInTheDocument();
    });
  });

  it('should cancel deletion when not confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);

    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('common.delete');
    await user.click(deleteButtons[0]);

    // Fetch should not be called for deletion
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything()
    );
  });

  it('should handle redirect URI management', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const manageUrisButtons = screen.getAllByText('tenant.applications.manageRedirectUris');
    await user.click(manageUrisButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('https://app1.com/callback')).toBeInTheDocument();
    });
  });

  it('should add redirect URI', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const manageUrisButtons = screen.getAllByText('tenant.applications.manageRedirectUris');
    await user.click(manageUrisButtons[0]);

    const input = screen.getByPlaceholderText('https://example.com/callback');
    await user.type(input, 'https://newuri.com/callback');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('tenant.applications.addRedirectUri'));

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.redirectUriAdded')).toBeInTheDocument();
    });
  });

  it('should handle org unit filtering', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

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

    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.title')).toBeInTheDocument();
    });

    // Should auto-select first rootOrgUnitId
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('org-1');
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('00000000-0000-0000-0000-000000000000')
      );
    });
  });

  it('should handle assign org units to application', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByText('tenant.applicationOrgUnits.selectOrgUnits');
    await user.click(assignButtons[0]);

    expect(screen.getByText('tenant.applicationOrgUnits.orgVisibility')).toBeInTheDocument();
  });

  it('should close create modal on cancel', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.applications.createApplication'));
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.applications.applicationName')).not.toBeInTheDocument();
    });
  });

  it('should close edit modal on cancel', async () => {
    const user = userEvent.setup();
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('App 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.applications.editApplication')).not.toBeInTheDocument();
    });
  });

  it('should display application types correctly', async () => {
    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.web')).toBeInTheDocument();
      expect(screen.getByText('tenant.applications.mobile')).toBeInTheDocument();
    });
  });

  it('should handle network error during creation', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TenantAppsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.applications.createApplication')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.applications.createApplication'));

    const nameInput = screen.getByLabelText('tenant.applications.applicationName');
    await user.type(nameInput, 'New App');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
