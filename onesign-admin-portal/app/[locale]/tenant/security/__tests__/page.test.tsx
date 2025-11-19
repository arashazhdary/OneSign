import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecurityCenterPage from '../page';

// Mock tenant context
jest.mock('@/lib/tenant-context', () => ({
  getTenantId: jest.fn(() => 'tenant-123')
}));

describe('SecurityCenterPage', () => {
  const mockPolicy = {
    id: 'policy-1',
    tenantId: 'tenant-123',
    mfaRequirement: 1,
    allowTrustedDevices: true,
    trustedDeviceExpireDays: 30,
    sessionTimeoutMinutes: 30,
    maxFailedLoginAttempts: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPolicy)
    });
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<SecurityCenterPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should render page title after loading', async () => {
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.title')).toBeInTheDocument();
    });
  });

  it('should display policy settings form', async () => {
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.policySettings')).toBeInTheDocument();
      expect(screen.getByText('security.mfaRequirement')).toBeInTheDocument();
      expect(screen.getByText('security.allowTrustedDevices')).toBeInTheDocument();
      expect(screen.getByText('security.trustedDeviceExpireDays')).toBeInTheDocument();
      expect(screen.getByText('security.sessionTimeoutMinutes')).toBeInTheDocument();
      expect(screen.getByText('security.maxFailedLoginAttempts')).toBeInTheDocument();
    });
  });

  it('should populate form with fetched policy values', async () => {
    render(<SecurityCenterPage />);

    await waitFor(() => {
      const mfaSelect = screen.getByRole('combobox');
      expect(mfaSelect).toHaveValue('1');

      const trustedDevicesCheckbox = screen.getByRole('checkbox');
      expect(trustedDevicesCheckbox).toBeChecked();
    });
  });

  it('should update policy successfully', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.updatePolicy')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPolicy)
    });

    await user.click(screen.getByText('security.updatePolicy'));

    await waitFor(() => {
      expect(screen.getByText('security.policyUpdated')).toBeInTheDocument();
    });
  });

  it('should handle policy update error', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.updatePolicy')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    await user.click(screen.getByText('security.updatePolicy'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should change MFA requirement', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.mfaRequirement')).toBeInTheDocument();
    });

    const mfaSelect = screen.getByRole('combobox');
    await user.selectOptions(mfaSelect, '2');

    expect(mfaSelect).toHaveValue('2');
  });

  it('should toggle trusted devices', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.allowTrustedDevices')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('should render MFA methods section', async () => {
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.mfaMethods')).toBeInTheDocument();
      expect(screen.getByText('security.mfaMethodsDescription')).toBeInTheDocument();
    });
  });

  it('should begin TOTP enrollment', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('security.scanQrCode')).toBeInTheDocument();
      expect(screen.getByText('security.enterTotpCode')).toBeInTheDocument();
    });
  });

  it('should confirm TOTP enrollment', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('security.enterTotpCode')).toBeInTheDocument();
    });

    const codeInput = screen.getByRole('textbox');
    await user.type(codeInput, '123456');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await user.click(screen.getByText('security.confirm'));

    await waitFor(() => {
      expect(screen.getByText('security.totpEnrolled')).toBeInTheDocument();
    });
  });

  it('should handle invalid TOTP code', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('security.enterTotpCode')).toBeInTheDocument();
    });

    const codeInput = screen.getByRole('textbox');
    await user.type(codeInput, '123456');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    await user.click(screen.getByText('security.confirm'));

    await waitFor(() => {
      expect(screen.getByText('security.invalidTotpCode')).toBeInTheDocument();
    });
  });

  it('should cancel TOTP enrollment', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('common.cancel'));

    await waitFor(() => {
      expect(screen.queryByText('security.scanQrCode')).not.toBeInTheDocument();
    });
  });

  it('should only allow numeric input for TOTP code', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('security.enterTotpCode')).toBeInTheDocument();
    });

    const codeInput = screen.getByRole('textbox');
    await user.type(codeInput, 'abc123');

    // Should only have numeric characters
    expect(codeInput).toHaveValue('123');
  });

  it('should disable confirm button until 6 digits entered', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'data:image/png;base64,test'
      })
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      const confirmButton = screen.getByText('security.confirm');
      expect(confirmButton).toBeDisabled();
    });

    const codeInput = screen.getByRole('textbox');
    await user.type(codeInput, '123456');

    const confirmButton = screen.getByText('security.confirm');
    expect(confirmButton).not.toBeDisabled();
  });

  it('should handle TOTP enrollment error', async () => {
    const user = userEvent.setup();
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.enrollTotp')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    await user.click(screen.getByText('security.enrollTotp'));

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });

  it('should display all MFA options', async () => {
    render(<SecurityCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('security.mfaNone')).toBeInTheDocument();
      expect(screen.getByText('security.mfaAdminsOnly')).toBeInTheDocument();
      expect(screen.getByText('security.mfaAllUsers')).toBeInTheDocument();
    });
  });
});
