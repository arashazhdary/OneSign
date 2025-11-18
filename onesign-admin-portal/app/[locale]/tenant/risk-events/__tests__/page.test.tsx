import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiskEventsPage from '../page';

// Mock tenant context
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn(() => 'tenant-123')
}));

describe('RiskEventsPage', () => {
  const mockEvents = [
    {
      id: 'event-1',
      userId: 'user-1',
      eventType: 1,
      riskLevel: 0,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      location: 'New York',
      details: 'Login from new device',
      occurredAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'event-2',
      userId: 'user-2',
      eventType: 3,
      riskLevel: 2,
      ipAddress: null,
      userAgent: null,
      location: null,
      details: null,
      occurredAt: '2024-01-01T11:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEvents)
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<RiskEventsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.title')).toBeInTheDocument();
    });
  });

  it('should display risk events in table', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.newDeviceLogin')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.multipleFailedLogins')).toBeInTheDocument();
    });
  });

  it('should display risk level badges correctly', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.low')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.high')).toBeInTheDocument();
    });
  });

  it('should display IP address', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });
  });

  it('should display dash for null values', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('should display location', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
  });

  it('should display details', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Login from new device')).toBeInTheDocument();
    });
  });

  it('should filter by event type', async () => {
    const user = userEvent.setup();
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.eventType')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('eventType=1'),
        expect.anything()
      );
    });
  });

  it('should filter by risk level', async () => {
    const user = userEvent.setup();
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.riskLevel')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], '2');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('riskLevel=2'),
        expect.anything()
      );
    });
  });

  it('should clear event type filter', async () => {
    const user = userEvent.setup();
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.eventType')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    // Set filter
    await user.selectOptions(selects[0], '1');
    // Clear filter
    await user.selectOptions(selects[0], '');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.not.stringContaining('eventType='),
        expect.anything()
      );
    });
  });

  it('should handle pagination - next page', async () => {
    const user = userEvent.setup();
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.next')).toBeInTheDocument();
    });

    await user.click(screen.getByText('common.next'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNumber=2'),
        expect.anything()
      );
    });
  });

  it('should handle pagination - previous page', async () => {
    const user = userEvent.setup();
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.next')).toBeInTheDocument();
    });

    // Go to page 2
    await user.click(screen.getByText('common.next'));

    // Go back to page 1
    await user.click(screen.getByText('common.previous'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNumber=1'),
        expect.anything()
      );
    });
  });

  it('should disable previous button on first page', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      const prevButton = screen.getByText('common.previous');
      expect(prevButton).toBeDisabled();
    });
  });

  it('should disable next button when less than pageSize events', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockEvents[0]]) // Only 1 event
    });

    render(<RiskEventsPage />);

    await waitFor(() => {
      const nextButton = screen.getByText('common.next');
      expect(nextButton).toBeDisabled();
    });
  });

  it('should display no events message when empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.noEvents')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should display all event type filter options', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.allTypes')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.newDeviceLogin')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.geoAnomaly')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.multipleFailedLogins')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.suspiciousActivity')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.accountLockout')).toBeInTheDocument();
    });
  });

  it('should display all risk level filter options', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.allLevels')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.low')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.medium')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.high')).toBeInTheDocument();
    });
  });

  it('should display formatted date', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      // Date should be formatted using toLocaleString()
      const dateElement = screen.getByText(/2024/);
      expect(dateElement).toBeInTheDocument();
    });
  });

  it('should display page number', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.page')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should display table headers correctly', async () => {
    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.date')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.eventType')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.riskLevel')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.ipAddress')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.location')).toBeInTheDocument();
      expect(screen.getByText('riskEvents.details')).toBeInTheDocument();
    });
  });

  it('should display unknown event type for invalid type', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ...mockEvents[0], eventType: 99 }])
    });

    render(<RiskEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('riskEvents.unknown')).toBeInTheDocument();
    });
  });

  it('should show medium risk level badge', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ...mockEvents[0], riskLevel: 1 }])
    });

    render(<RiskEventsPage />);

    await waitFor(() => {
      const badge = screen.getByText('riskEvents.medium');
      expect(badge).toHaveClass('bg-yellow-100');
    });
  });
});
