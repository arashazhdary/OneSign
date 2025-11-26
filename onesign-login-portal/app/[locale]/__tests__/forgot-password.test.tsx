import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '../forgot-password/page';
import { getTenantId, setTenantId } from '@/lib/tenant-context';

jest.mock('@/lib/tenant-context');

const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('ForgotPasswordPage', () => {
  const mockGetTenantId = getTenantId as jest.Mock;
  const mockSetTenantId = setTenantId as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('tenantId');

    mockGetTenantId.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe('Rendering', () => {
    it('should render forgot password form', () => {
      render(<ForgotPasswordPage />);

      expect(screen.getByText('forgotPassword.title')).toBeInTheDocument();
      expect(screen.getByText('forgotPassword.description')).toBeInTheDocument();
      expect(screen.getByLabelText('common.email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /forgotPassword.sendResetLink/i })).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      render(<ForgotPasswordPage />);

      const backLink = screen.getByText('forgotPassword.backToLogin');
      expect(backLink).toHaveAttribute('href', '/en/login');
    });
  });

  describe('Tenant ID handling', () => {
    it('should use tenantId from URL search params', async () => {
      mockSearchParams.set('tenantId', 'url-tenant-id');

      render(<ForgotPasswordPage />);

      await waitFor(() => {
        expect(mockSetTenantId).toHaveBeenCalledWith('url-tenant-id');
      });
    });

    it('should use tenantId from context when not in URL', async () => {
      mockGetTenantId.mockReturnValue('context-tenant-id');

      render(<ForgotPasswordPage />);

      // Form submission would use context tenant ID
      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await userEvent.setup().type(emailInput, 'test@example.com');
      await userEvent.setup().click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:7000/api/auth/forgot-password?tenantId=context-tenant-id',
          expect.any(Object)
        );
      });
    });

    it('should use default tenantId when not available', async () => {
      mockGetTenantId.mockReturnValue(null);

      render(<ForgotPasswordPage />);

      const user = userEvent.setup();
      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:7000/api/auth/forgot-password?tenantId=00000000-0000-0000-0000-000000000000',
          expect.any(Object)
        );
      });
    });
  });

  describe('Form submission', () => {
    it('should submit email to forgot password API', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:7000/api/auth/forgot-password?tenantId=test-tenant',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com' }),
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

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /common.loading/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('forgotPassword.resetLinkSent')).toBeInTheDocument();
      });
    });

    it('should show back to login link in success state', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backLink = screen.getByText('forgotPassword.backToLogin');
        expect(backLink).toHaveAttribute('href', '/en/login');
      });
    });

    it('should display error message on failed submission', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Email not found' }),
      });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'unknown@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });
    });

    it('should display default error message when no errorMessage provided', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

    it('should display error on fetch exception', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('tenantId', 'test-tenant');

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      const submitButton = screen.getByRole('button', { name: /forgotPassword.sendResetLink/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

  });

  describe('Email input', () => {
    it('should update email state on input change', async () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should have email type attribute', () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should be required', () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText('common.email');
      expect(emailInput).toBeRequired();
    });
  });
});
