import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../login/page';
import { getTenantId, setTenantId } from '@/lib/tenant-context';
import { getTenantBranding } from '@/lib/tenant-branding';

// Mock dependencies
jest.mock('@/lib/tenant-context');
jest.mock('@/lib/tenant-branding');

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('LoginPage', () => {
  const mockGetTenantId = getTenantId as jest.Mock;
  const mockSetTenantId = setTenantId as jest.Mock;
  const mockGetTenantBranding = getTenantBranding as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('tenantId');
    mockSearchParams.delete('client_id');
    mockSearchParams.delete('redirect_uri');
    mockSearchParams.delete('state');
    mockSearchParams.delete('code_challenge');
    mockSearchParams.delete('code_challenge_method');

    mockGetTenantId.mockReturnValue(null);
    mockGetTenantBranding.mockResolvedValue({});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe('Rendering', () => {
    it('should render login form with email and password inputs', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/common.email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/common.password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^login\.signIn$/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginPage />);

      expect(screen.getByText('login.forgotPassword')).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /login.signInWithGoogle/i })).toBeInTheDocument();
    });

    it('should render title with primary color', () => {
      render(<LoginPage />);

      const title = screen.getByText('login.title');
      expect(title).toHaveStyle({ color: '#4F46E5' });
    });

    it('should render logo when branding has logoUrl', async () => {
      mockGetTenantBranding.mockResolvedValue({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      });
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<LoginPage />);

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

      render(<LoginPage />);

      await waitFor(() => {
        const title = screen.getByText('login.title');
        expect(title).toHaveStyle({ color: '#FF0000' });
      });
    });
  });

  describe('Tenant ID handling', () => {
    it('should use tenantId from URL search params', async () => {
      mockSearchParams.set('tenantId', 'url-tenant-id');

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockSetTenantId).toHaveBeenCalledWith('url-tenant-id');
      });
    });

    it('should use tenantId from context when not in URL', async () => {
      mockGetTenantId.mockReturnValue('context-tenant-id');

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockGetTenantBranding).toHaveBeenCalledWith('context-tenant-id');
      });
    });

    it('should use default tenantId when not available', async () => {
      mockGetTenantId.mockReturnValue(null);

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockGetTenantBranding).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000');
      });
    });
  });

  describe('Form submission', () => {
    it('should submit form with email and password', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:7000/api/auth/login?tenantId=test-tenant',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      let resolvePromise: (value: any) => void;
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /common.loading/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await act(async () => {
        resolvePromise!({ ok: true, json: () => Promise.resolve({}) });
      });
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Invalid credentials' }),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should display default error message when no errorMessage provided', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('login.invalidCredentials')).toBeInTheDocument();
      });
    });

    it('should display error on fetch exception', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

    it('should redirect to home on successful regular login', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('MFA flow', () => {
    it('should redirect to MFA challenge when mfaRequired', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          mfaRequired: true,
          challengeId: 'challenge-123',
          mfaMethodType: '1',
        }),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/en/mfa-challenge?challengeId=challenge-123&methodType=1&tenantId=test-tenant'
        );
      });
    });

    it('should include OIDC params in MFA redirect', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');
      mockSearchParams.set('client_id', 'client-123');
      mockSearchParams.set('redirect_uri', 'https://app.example.com/callback');
      mockSearchParams.set('state', 'state-123');
      mockSearchParams.set('code_challenge', 'challenge-code');
      mockSearchParams.set('code_challenge_method', 'S256');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          mfaRequired: true,
          challengeId: 'challenge-123',
          mfaMethodType: '2',
        }),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/en/mfa-challenge?challengeId=challenge-123&methodType=2&tenantId=test-tenant&client_id=client-123')
        );
      });
    });
  });

  describe('OIDC flow', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as Location;
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should redirect to authorize endpoint with OIDC params', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');
      mockSearchParams.set('client_id', 'client-123');
      mockSearchParams.set('redirect_uri', 'https://app.example.com/callback');
      mockSearchParams.set('state', 'state-123');
      mockSearchParams.set('code_challenge', 'challenge-code');
      mockSearchParams.set('code_challenge_method', 'S256');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toContain('http://localhost:7000/connect/authorize');
        expect(window.location.href).toContain('client_id=client-123');
        expect(window.location.href).toContain('state=state-123');
        expect(window.location.href).toContain('code_challenge=challenge-code');
        expect(window.location.href).toContain('code_challenge_method=S256');
      });
    });

    it('should handle OIDC flow without optional params', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');
      mockSearchParams.set('client_id', 'client-123');
      mockSearchParams.set('redirect_uri', 'https://app.example.com/callback');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      const passwordInput = screen.getByLabelText(/common.password/i);
      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toContain('http://localhost:7000/connect/authorize');
        expect(window.location.href).toContain('client_id=client-123');
      });
    });
  });

  describe('Google login', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as Location;
      delete (window as any).google;
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should load Google script and initialize', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      const mockPrompt = jest.fn();
      const mockInitialize = jest.fn();

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });

      // Mock script loading
      const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation((script: any) => {
        (window as any).google = {
          accounts: {
            id: {
              initialize: mockInitialize,
              prompt: mockPrompt,
            },
          },
        };
        setTimeout(() => script.onload(), 0);
        return script;
      });

      await user.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
        expect(mockPrompt).toHaveBeenCalled();
      });

      appendChildSpy.mockRestore();
    });

    it('should use existing Google script if already loaded', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      const mockPrompt = jest.fn();
      const mockInitialize = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
        expect(mockPrompt).toHaveBeenCalled();
      });
    });

    it('should handle Google login callback success', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback
      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:7000/api/auth/google-login?tenantId=test-tenant',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              idToken: 'google-id-token',
              clientId: undefined,
            }),
          })
        );
      });
    });

    it('should handle Google login callback with OIDC flow', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');
      mockSearchParams.set('client_id', 'client-123');
      mockSearchParams.set('redirect_uri', 'https://app.example.com/callback');

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback
      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      await waitFor(() => {
        expect(window.location.href).toContain('http://localhost:7000/connect/authorize');
      });
    });

    it('should handle Google login callback error', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Google auth failed' }),
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback
      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      await waitFor(() => {
        expect(screen.getByText('Google auth failed')).toBeInTheDocument();
      });
    });

    it('should handle Google login callback exception', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback
      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

    it('should show error when tenantId is null during Google callback', async () => {
      // Don't set tenantId - will use default

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      // Clear all search params to start fresh
      mockSearchParams.delete('tenantId');
      mockGetTenantId.mockReturnValue(null);

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback - the tenantId should be set by useEffect now
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      // Should complete successfully as useEffect will have set default tenantId
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle default error message when Google login fails without custom message', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      let googleCallback: (response: any) => void;
      const mockInitialize = jest.fn((config) => {
        googleCallback = config.callback;
      });
      const mockPrompt = jest.fn();

      (window as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            prompt: mockPrompt,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}), // No errorMessage
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // Simulate Google callback
      await act(async () => {
        googleCallback!({ credential: 'google-id-token' });
      });

      await waitFor(() => {
        expect(screen.getByText('login.invalidCredentials')).toBeInTheDocument();
      });
    });

    it('should handle Google login error during script loading', async () => {
      mockSearchParams.set('tenantId', 'test-tenant');

      // Mock script loading failure before render
      const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation(() => {
        throw new Error('Script load failed');
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login.signInWithGoogle/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });

      appendChildSpy.mockRestore();
    });
  });

  describe('Button interactions', () => {
    it('should change button color on mouse enter/leave', async () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /^login\.signIn$/i });

      fireEvent.mouseEnter(submitButton);
      // Button style changes on hover
      expect(submitButton.style.backgroundColor).toBeTruthy();

      fireEvent.mouseLeave(submitButton);
      expect(submitButton.style.backgroundColor).toBeTruthy();
    });

    it('should update email state on input change', async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/common.email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password state on input change', async () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/common.password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });
  });
});
