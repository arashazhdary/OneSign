import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from '../reset-password/page';

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

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchParams.delete('token');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render reset password form', () => {
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      expect(screen.getByText('resetPassword.title')).toBeInTheDocument();
      expect(screen.getByText('resetPassword.description')).toBeInTheDocument();
      expect(screen.getByLabelText('resetPassword.newPassword')).toBeInTheDocument();
      expect(screen.getByLabelText('resetPassword.confirmPassword')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resetPassword.resetPassword/i })).toBeInTheDocument();
    });

    it('should have password type inputs', () => {
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      expect(screen.getByLabelText('resetPassword.newPassword')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('resetPassword.confirmPassword')).toHaveAttribute('type', 'password');
    });

    it('should have required inputs', () => {
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      expect(screen.getByLabelText('resetPassword.newPassword')).toBeRequired();
      expect(screen.getByLabelText('resetPassword.confirmPassword')).toBeRequired();
    });
  });

  describe('Form validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      expect(screen.getByText('resetPassword.passwordsDoNotMatch')).toBeInTheDocument();
    });

    it('should show error when token is missing', async () => {
      const user = userEvent.setup({ delay: null });
      // Don't set token

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Invalid reset token')).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should submit new password to reset API', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:9091/api/auth/reset-password',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: 'valid-token',
              newPassword: 'newpassword123',
            }),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      let resolvePromise: (value: any) => void;
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /common.loading/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show success message after successful reset', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('resetPassword.passwordResetSuccess')).toBeInTheDocument();
        expect(screen.getByText('Redirecting to login page...')).toBeInTheDocument();
      });
    });

    it('should redirect to login after success with timeout', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('resetPassword.passwordResetSuccess')).toBeInTheDocument();
      });

      // Fast forward the timer
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockPush).toHaveBeenCalledWith('/en/login');
    });

    it('should display error message on failed submission', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorMessage: 'Token expired' }),
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Token expired')).toBeInTheDocument();
      });
    });

    it('should display default error message when no errorMessage provided', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });

    it('should display error on fetch exception', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('common.error')).toBeInTheDocument();
      });
    });
  });

  describe('Password input state', () => {
    it('should update newPassword state on input change', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      await user.type(newPasswordInput, 'mypassword');

      expect(newPasswordInput).toHaveValue('mypassword');
    });

    it('should update confirmPassword state on input change', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      await user.type(confirmPasswordInput, 'mypassword');

      expect(confirmPasswordInput).toHaveValue('mypassword');
    });
  });

  describe('Success state rendering', () => {
    it('should display success UI with green styling', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchParams.set('token', 'valid-token');

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText('resetPassword.newPassword');
      const confirmPasswordInput = screen.getByLabelText('resetPassword.confirmPassword');
      const submitButton = screen.getByRole('button', { name: /resetPassword.resetPassword/i });

      await user.type(newPasswordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        const successTitle = screen.getByText('resetPassword.passwordResetSuccess');
        expect(successTitle).toHaveClass('text-green-600');
      });
    });
  });
});
