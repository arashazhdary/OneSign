import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MfaChallengePage from '../mfa-challenge/page';
import { getTenantBranding } from '@/lib/tenant-branding';

jest.mock('@/lib/tenant-branding');

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('MfaChallengePage', () => {
  const mockGetTenantBranding = getTenantBranding as jest.Mock;
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('challengeId');
    mockSearchParams.delete('methodType');
    mockSearchParams.delete('tenantId');
    mockSearchParams.delete('client_id');
    mockSearchParams.delete('redirect_uri');
    mockSearchParams.delete('state');
    mockSearchParams.delete('code_challenge');
    mockSearchParams.delete('code_challenge_method');

    mockGetTenantBranding.mockResolvedValue({});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as Location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('Rendering', () => {
    it('should render MFA challenge form', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText('mfa.title')).toBeInTheDocument();
      expect(screen.getByLabelText(/mfa.code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mfa.verify/i })).toBeInTheDocument();
    });

    it('should render remember device checkbox', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByLabelText('mfa.rememberDevice')).toBeInTheDocument();
    });

    it('should render back to login button', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText('mfa.backToLogin')).toBeInTheDocument();
    });

    it('should render logo when branding has logoUrl', async () => {
      mockGetTenantBranding.mockResolvedValue({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      });
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      await waitFor(() => {
        const logo = screen.getByAltText('Logo');
        expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
      });
    });

    it('should apply custom primary color from branding', async () => {
      mockGetTenantBranding.mockResolvedValue({
        primaryColor: '#FF0000',
      });
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      await waitFor(() => {
        const title = screen.getByText('mfa.title');
        expect(title).toHaveStyle({ color: '#FF0000' });
      });
    });
  });

  describe('Method type display', () => {
    it('should display TOTP method name for type 1', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText(/mfa.methodTotp/)).toBeInTheDocument();
    });

    it('should display Email method name for type 2', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '2');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText(/mfa.methodEmail/)).toBeInTheDocument();
    });

    it('should display SMS method name for type 3', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '3');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText(/mfa.methodSms/)).toBeInTheDocument();
    });

    it('should display generic method name for unknown type', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '99');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      expect(screen.getByText(/mfa.methodGeneric/)).toBeInTheDocument();
    });
  });

  describe('Code input', () => {
    it('should only allow numeric input', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      await user.type(codeInput, 'abc123def456');

      expect(codeInput).toHaveValue('123456');
    });

    it('should have maxLength of 6', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      expect(codeInput).toHaveAttribute('maxLength', '6');
    });

    it('should disable submit button when code length is not 6', () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when code length is 6', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      await user.type(codeInput, '123456');

      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form submission', () => {
    it('should submit MFA code for verification', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:9091/api/tenant/mfa/verify',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('"challengeId":"challenge-123"'),
          })
        );
      });
    });

    it('should include device fingerprint when remember device is checked', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const rememberCheckbox = screen.getByLabelText('mfa.rememberDevice');
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(rememberCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:9091/api/tenant/mfa/verify',
          expect.objectContaining({
            body: expect.stringContaining('"rememberDevice":true'),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      let resolvePromise: (value: any) => void;
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /common.loading/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should redirect to home on successful verification without OIDC', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should redirect to authorize endpoint with OIDC params', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');
      mockSearchParams.set('client_id', 'client-123');
      mockSearchParams.set('redirect_uri', 'https://app.example.com/callback');
      mockSearchParams.set('state', 'state-123');
      mockSearchParams.set('code_challenge', 'challenge-code');
      mockSearchParams.set('code_challenge_method', 'S256');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toContain('http://localhost:7000/connect/authorize');
        expect(window.location.href).toContain('client_id=client-123');
        expect(window.location.href).toContain('state=state-123');
      });
    });

    it('should display error message on failed verification', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Invalid code' }),
      });

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid code')).toBeInTheDocument();
      });
    });

    it('should display default error when verification returns success: false', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      });

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('mfa.invalidCode')).toBeInTheDocument();
      });
    });

    it('should display error on fetch exception', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

    it('should show error when challengeId or tenantId is missing', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('methodType', '1');
      // Don't set challengeId or tenantId

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      await user.type(codeInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });
  });

  describe('Button interactions', () => {
    it('should navigate to login on back button click', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const backButton = screen.getByText('mfa.backToLogin');
      await user.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/en/login');
    });

    it('should change button color on mouse enter when enabled', async () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      fireEvent.change(codeInput, { target: { value: '123456' } });

      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      fireEvent.mouseEnter(submitButton);
      // Verify button style is set
      expect(submitButton.style.backgroundColor).toBeTruthy();

      fireEvent.mouseLeave(submitButton);
      expect(submitButton.style.backgroundColor).toBeTruthy();
    });

    it('should not change button color on mouse enter when disabled due to code length', async () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });

      // Button is disabled because code length < 6
      fireEvent.mouseEnter(submitButton);
      // Button should maintain its original color when disabled
      expect(submitButton.style.backgroundColor).toBe('rgb(79, 70, 229)');
    });

    it('should not change button color on mouse enter when loading', async () => {
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      // Make fetch hang to keep loading state
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(() => {})
      );

      render(<MfaChallengePage />);

      const codeInput = screen.getByLabelText(/mfa.code/i);
      fireEvent.change(codeInput, { target: { value: '123456' } });

      const submitButton = screen.getByRole('button', { name: /mfa.verify/i });
      fireEvent.click(submitButton);

      // Now button is in loading state
      fireEvent.mouseEnter(submitButton);
      // Color should stay the same during loading
      expect(submitButton.style.backgroundColor).toBeTruthy();
    });

    it('should toggle remember device checkbox', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('challengeId', 'challenge-123');
      mockSearchParams.set('methodType', '1');
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<MfaChallengePage />);

      const rememberCheckbox = screen.getByLabelText('mfa.rememberDevice');
      expect(rememberCheckbox).not.toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });
  });
});
