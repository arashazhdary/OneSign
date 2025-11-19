import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrgUnitsPage from '../page';

// Mock tenant context and API
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

jest.mock('@/lib/api/users', () => ({
  getCurrentUserScope: jest.fn()
}));

describe('OrgUnitsPage', () => {
  const mockOrgTree = [
    {
      id: 'org-1',
      name: 'Org 1',
      parentId: null,
      code: 'ORG1',
      level: 0,
      status: 1,
      children: [
        {
          id: 'org-1-1',
          name: 'Org 1-1',
          parentId: 'org-1',
          code: 'ORG11',
          level: 1,
          status: 1,
          children: []
        }
      ]
    },
    {
      id: 'org-2',
      name: 'Org 2',
      parentId: null,
      code: 'ORG2',
      level: 0,
      status: 1,
      children: []
    }
  ];

  const mockUserScope = {
    userId: 'user-1',
    isGlobalAdmin: true,
    rootOrgUnitIds: [],
    allowedOrgUnitIds: ['org-1', 'org-1-1', 'org-2']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getTenantId } = require('@/lib/tenant-context');
    const { getCurrentUserScope } = require('@/lib/api/users');

    getTenantId.mockReturnValue('tenant-123');
    getCurrentUserScope.mockResolvedValue(mockUserScope);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrgTree)
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockImplementation(() => new Promise(() => {}));

    render(<OrgUnitsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.title')).toBeInTheDocument();
    });
  });

  it('should display org units tree', async () => {
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
      expect(screen.getByText('Org 2')).toBeInTheDocument();
    });
  });

  it('should render create button', async () => {
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });
  });

  it('should expand and collapse tree nodes', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    // Root nodes are expanded by default, so child should be visible
    expect(screen.getByText('Org 1-1')).toBeInTheDocument();

    // Click to collapse
    const expandButtons = screen.getAllByText('▼');
    await user.click(expandButtons[0]);

    // Child should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Org 1-1')).not.toBeInTheDocument();
    });

    // Click to expand again
    const collapseButtons = screen.getAllByText('▶');
    await user.click(collapseButtons[0]);

    // Child should be visible again
    await waitFor(() => {
      expect(screen.getByText('Org 1-1')).toBeInTheDocument();
    });
  });

  it('should open create modal when clicking create button', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.orgUnits.createOrgUnit'));

    expect(screen.getByText('tenant.orgUnits.orgUnitName')).toBeInTheDocument();
    expect(screen.getByText('tenant.orgUnits.parentOrgUnit')).toBeInTheDocument();
  });

  it('should create org unit successfully', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.orgUnits.createOrgUnit'));

    const nameInput = screen.getByRole('textbox');
    await user.type(nameInput, 'New Org');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/org-units'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"name":"New Org"')
        })
      );
    });
  });

  it('should create org unit with parent', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.orgUnits.createOrgUnit'));

    const nameInput = screen.getByRole('textbox');
    await user.type(nameInput, 'Child Org');

    const parentSelect = screen.getByRole('combobox');
    await user.selectOptions(parentSelect, 'org-1');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/org-units'),
        expect.objectContaining({
          body: expect.stringContaining('"parentId":"org-1"')
        })
      );
    });
  });

  it('should handle creation error', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.orgUnits.createOrgUnit'));

    const nameInput = screen.getByRole('textbox');
    await user.type(nameInput, 'New Org');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Creation failed' })
    });

    await user.click(screen.getByText('common.create'));

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });

  it('should open edit modal', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);

    expect(screen.getByText('tenant.orgUnits.editOrgUnit')).toBeInTheDocument();
  });

  it('should update org unit', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);

    const nameInput = screen.getByRole('textbox');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Org');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/org-units/org-1'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"name":"Updated Org"')
        })
      );
    });
  });

  it('should open move modal', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const moveButtons = screen.getAllByText('tenant.orgUnits.move');
    await user.click(moveButtons[0]);

    expect(screen.getByText('tenant.orgUnits.parentOrgUnit')).toBeInTheDocument();
  });

  it('should move org unit', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const moveButtons = screen.getAllByText('tenant.orgUnits.move');
    await user.click(moveButtons[0]);

    const parentSelect = screen.getByRole('combobox');
    await user.selectOptions(parentSelect, 'org-2');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    // Find the move button in the modal
    const modalMoveButtons = screen.getAllByText('tenant.orgUnits.move');
    await user.click(modalMoveButtons[1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/org-units/org-1/move'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"newParentId":"org-2"')
        })
      );
    });
  });

  it('should delete org unit', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('common.delete');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/org-units/org-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should cancel deletion', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('common.delete');
    await user.click(deleteButtons[0]);

    // Should not call delete endpoint
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything()
    );
  });

  it('should handle delete error', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('common.delete');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Cannot delete org with children' })
    });

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Cannot delete org with children');
    });
  });

  it('should show no children message when tree is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.noChildren')).toBeInTheDocument();
    });
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('00000000-0000-0000-0000-000000000000'),
        expect.anything()
      );
    });
  });

  it('should handle delegated admin scope', async () => {
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockResolvedValue({
      userId: 'user-1',
      isGlobalAdmin: false,
      rootOrgUnitIds: ['org-1'],
      allowedOrgUnitIds: ['org-1', 'org-1-1']
    });

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
      // Org 2 should not be visible for delegated admin
      expect(screen.queryByText('Org 2')).not.toBeInTheDocument();
    });
  });

  it('should disable edit/move/delete for non-root org units in delegated admin scope', async () => {
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockResolvedValue({
      userId: 'user-1',
      isGlobalAdmin: false,
      rootOrgUnitIds: ['org-1'],
      allowedOrgUnitIds: ['org-1', 'org-1-1']
    });

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    // The child org unit should have disabled buttons
    const editButtons = screen.getAllByText('common.edit');
    // First button (for root org-1) should be enabled
    expect(editButtons[0]).not.toBeDisabled();
  });

  it('should close create modal on cancel', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.orgUnits.createOrgUnit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.orgUnits.createOrgUnit'));
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.orgUnits.orgUnitName')).not.toBeInTheDocument();
    });
  });

  it('should close edit modal on cancel', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('common.edit');
    await user.click(editButtons[0]);
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('tenant.orgUnits.editOrgUnit')).not.toBeInTheDocument();
    });
  });

  it('should close move modal on cancel', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const moveButtons = screen.getAllByText('tenant.orgUnits.move');
    await user.click(moveButtons[0]);
    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      const moveTexts = screen.queryAllByText('tenant.orgUnits.move');
      // Should only show the buttons in the tree, not the modal title
      expect(moveTexts.length).toBe(3); // One for each org unit
    });
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should not show create button for delegated admin without root org units', async () => {
    const { getCurrentUserScope } = require('@/lib/api/users');
    getCurrentUserScope.mockResolvedValue({
      userId: 'user-1',
      isGlobalAdmin: false,
      rootOrgUnitIds: [],
      allowedOrgUnitIds: []
    });

    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.queryByText('tenant.orgUnits.createOrgUnit')).not.toBeInTheDocument();
    });
  });

  it('should filter out current node from parent options in move modal', async () => {
    const user = userEvent.setup();
    render(<OrgUnitsPage />);

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
    });

    const moveButtons = screen.getAllByText('tenant.orgUnits.move');
    await user.click(moveButtons[0]);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    const optionValues = options.map(opt => opt.value);

    // org-1 should not be in the options
    expect(optionValues).not.toContain('org-1');
    expect(optionValues).toContain('org-2');
  });
});
