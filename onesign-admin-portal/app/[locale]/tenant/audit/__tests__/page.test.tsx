import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantAuditPage from '../page';

// Mock tenant context
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

describe('TenantAuditPage', () => {
  const mockEvents = [
    {
      id: '1',
      eventType: 'UserLogin',
      description: 'User logged in',
      actorId: 'user-1',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      eventType: 'UserCreated',
      description: 'User was created',
      actorId: null,
      createdAt: '2024-01-01T11:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue('tenant-123');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: mockEvents })
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TenantAuditPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render audit page title after loading', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.title')).toBeInTheDocument();
    });
  });

  it('should display audit events in table', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('UserLogin')).toBeInTheDocument();
      expect(screen.getByText('User logged in')).toBeInTheDocument();
      expect(screen.getByText('user-1')).toBeInTheDocument();
    });
  });

  it('should display dash for null actorId', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('should render date filter inputs', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.fromDate')).toBeInTheDocument();
      expect(screen.getByText('tenant.audit.toDate')).toBeInTheDocument();
    });
  });

  it('should filter by date range', async () => {
    const user = userEvent.setup();
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.filter')).toBeInTheDocument();
    });

    const fromDateInput = screen.getAllByRole('textbox')[0] || screen.getByLabelText('tenant.audit.fromDate');

    // Find date inputs
    const dateInputs = screen.getAllByDisplayValue('');
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2024-01-31' } });
    }

    await user.click(screen.getByText('tenant.audit.filter'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fromDate=')
      );
    });
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('11111111-1111-1111-1111-111111111111')
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.title')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.title')).toBeInTheDocument();
    });
  });

  it('should render table headers correctly', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.eventType')).toBeInTheDocument();
      expect(screen.getByText('tenant.audit.description')).toBeInTheDocument();
      expect(screen.getByText('tenant.audit.actor')).toBeInTheDocument();
      expect(screen.getByText('tenant.audit.timestamp')).toBeInTheDocument();
    });
  });

  it('should display formatted date', async () => {
    render(<TenantAuditPage />);

    await waitFor(() => {
      // Date should be formatted using toLocaleString()
      const dateElement = screen.getByText(/2024/);
      expect(dateElement).toBeInTheDocument();
    });
  });

  it('should set loading state when filtering', async () => {
    const user = userEvent.setup();
    render(<TenantAuditPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.audit.filter')).toBeInTheDocument();
    });

    await user.click(screen.getByText('tenant.audit.filter'));

    // After clicking filter, fetch should be called again
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

// Helper function for fireEvent
import { fireEvent } from '@testing-library/react';
