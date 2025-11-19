import React from 'react';
import { render, screen } from '@testing-library/react';
import TenantLayout from '../layout';

// Mock usePathname to return a specific path
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: () => mockPathname()
}));

describe('TenantLayout', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/en/tenant/dashboard');
  });

  it('should render children', () => {
    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render OneSign branding', () => {
    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    expect(screen.getByText('OneSign')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    expect(screen.getByText('common.dashboard')).toBeInTheDocument();
    expect(screen.getByText('common.users')).toBeInTheDocument();
    expect(screen.getByText('common.applications')).toBeInTheDocument();
    expect(screen.getByText('tenant.orgUnits.title')).toBeInTheDocument();
    expect(screen.getByText('tenant.delegatedAdmins.title')).toBeInTheDocument();
    expect(screen.getByText('common.audit')).toBeInTheDocument();
    expect(screen.getByText('common.settings')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    mockPathname.mockReturnValue('/en/tenant/dashboard');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const dashboardLink = screen.getByText('common.dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-indigo-100');
    expect(dashboardLink).toHaveClass('text-indigo-700');
  });

  it('should not highlight inactive navigation items', () => {
    mockPathname.mockReturnValue('/en/tenant/dashboard');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const usersLink = screen.getByText('common.users').closest('a');
    expect(usersLink).not.toHaveClass('bg-indigo-100');
    expect(usersLink).toHaveClass('text-gray-700');
  });

  it('should render correct links for English locale', () => {
    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const dashboardLink = screen.getByText('common.dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/en/tenant/dashboard');
  });

  it('should highlight users page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/users');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const usersLink = screen.getByText('common.users').closest('a');
    expect(usersLink).toHaveClass('bg-indigo-100');
  });

  it('should highlight apps page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/apps');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const appsLink = screen.getByText('common.applications').closest('a');
    expect(appsLink).toHaveClass('bg-indigo-100');
  });

  it('should highlight org-units page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/org-units');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const orgUnitsLink = screen.getByText('tenant.orgUnits.title').closest('a');
    expect(orgUnitsLink).toHaveClass('bg-indigo-100');
  });

  it('should highlight delegated-admins page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/delegated-admins');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const delegatedAdminsLink = screen.getByText('tenant.delegatedAdmins.title').closest('a');
    expect(delegatedAdminsLink).toHaveClass('bg-indigo-100');
  });

  it('should highlight audit page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/audit');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const auditLink = screen.getByText('common.audit').closest('a');
    expect(auditLink).toHaveClass('bg-indigo-100');
  });

  it('should highlight settings page when active', () => {
    mockPathname.mockReturnValue('/en/tenant/settings');

    render(
      <TenantLayout>
        <div>Test Content</div>
      </TenantLayout>
    );

    const settingsLink = screen.getByText('common.settings').closest('a');
    expect(settingsLink).toHaveClass('bg-indigo-100');
  });
});
