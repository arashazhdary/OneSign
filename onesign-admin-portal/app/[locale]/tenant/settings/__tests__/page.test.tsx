import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantSettingsPage from '../page';

// Mock tenant context
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn()
}));

describe('TenantSettingsPage', () => {
  const mockSettings = {
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#6366f1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue('tenant-123');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings)
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TenantSettingsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.settings.title')).toBeInTheDocument();
    });
  });

  it('should display branding section', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.settings.branding')).toBeInTheDocument();
    });
  });

  it('should populate form with fetched settings', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
      expect(logoInput).toHaveValue('https://example.com/logo.png');

      const colorInput = screen.getByPlaceholderText('#6366f1');
      expect(colorInput).toHaveValue('#6366f1');
    });
  });

  it('should display logo preview', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      const preview = screen.getByAltText('Logo preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', 'https://example.com/logo.png');
    });
  });

  it('should display color preview', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      const colorPreviews = screen.getAllByRole('generic').filter(
        el => el.style.backgroundColor === 'rgb(99, 102, 241)'
      );
      expect(colorPreviews.length).toBeGreaterThan(0);
    });
  });

  it('should save settings successfully', async () => {
    const user = userEvent.setup();
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings)
    });

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('tenant.settings.brandingUpdated')).toBeInTheDocument();
    });
  });

  it('should handle save error', async () => {
    const user = userEvent.setup();
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: 'Save failed' })
    });

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('should handle network error during save', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should reset form on cancel', async () => {
    const user = userEvent.setup();
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
    });

    // Change the logo URL
    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await user.clear(logoInput);
    await user.type(logoInput, 'https://new-logo.com/logo.png');

    // Cancel changes
    await user.click(screen.getByText('common.cancel'));

    expect(logoInput).toHaveValue('https://example.com/logo.png');
  });

  it('should update logo URL input', async () => {
    const user = userEvent.setup();
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
    });

    const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
    await user.clear(logoInput);
    await user.type(logoInput, 'https://new-logo.com/logo.png');

    expect(logoInput).toHaveValue('https://new-logo.com/logo.png');
  });

  it('should update primary color input', async () => {
    const user = userEvent.setup();
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('#6366f1')).toBeInTheDocument();
    });

    const colorInput = screen.getByPlaceholderText('#6366f1');
    await user.clear(colorInput);
    await user.type(colorInput, '#ff0000');

    expect(colorInput).toHaveValue('#ff0000');
  });

  it('should use default tenant ID when context returns null', async () => {
    const { getTenantId } = require('@/lib/tenant-context');
    getTenantId.mockReturnValue(null);

    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('11111111-1111-1111-1111-111111111111')
      );
    });
  });

  it('should handle fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.settings.title')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should show loading state on save button while saving', async () => {
    const user = userEvent.setup();

    let resolvePromise: (value: any) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(slowPromise);

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    // Button should show loading text
    expect(screen.getByText('common.loading')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve(mockSettings)
    });

    await waitFor(() => {
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });
  });

  it('should render form labels correctly', async () => {
    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('tenant.settings.logoUrl')).toBeInTheDocument();
      expect(screen.getByText('tenant.settings.primaryColor')).toBeInTheDocument();
    });
  });

  it('should handle empty settings', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });

    render(<TenantSettingsPage />);

    await waitFor(() => {
      const logoInput = screen.getByPlaceholderText('https://example.com/logo.png');
      expect(logoInput).toHaveValue('');
    });
  });

  it('should not show logo preview when URL is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ primaryColor: '#6366f1' })
    });

    render(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.queryByAltText('Logo preview')).not.toBeInTheDocument();
    });
  });
});
