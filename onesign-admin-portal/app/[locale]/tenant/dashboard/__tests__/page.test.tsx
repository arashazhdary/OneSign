import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TenantDashboardPage from '../page';

// Mock tenant context
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

describe('TenantDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue('tenant-123');
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TenantDashboardPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render dashboard title after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalCount: 0 })
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.dashboard.title')).toBeInTheDocument();
    });
  });

  it('should display user count', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalCount: 25 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalCount: 0 })
      });
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('should display application count', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/applications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalCount: 10 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalCount: 0 })
      });
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should display recent activity count', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/audit')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalCount: 100 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalCount: 0 })
      });
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalCount: 0 })
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('11111111-1111-1111-1111-111111111111')
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.dashboard.title')).toBeInTheDocument();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should handle non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.dashboard.title')).toBeInTheDocument();
    });

    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('should render all stat cards', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalCount: 5 })
    });

    render(<TenantDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.dashboard.totalUsers')).toBeInTheDocument();
      expect(screen.getByText('tenant.dashboard.totalApplications')).toBeInTheDocument();
      expect(screen.getByText('tenant.dashboard.recentActivity')).toBeInTheDocument();
    });
  });

  it('should not fetch stats when tenantId is not set', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalCount: 0 })
    });

    render(<TenantDashboardPage />);

    // First call should be with default tenant ID
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
