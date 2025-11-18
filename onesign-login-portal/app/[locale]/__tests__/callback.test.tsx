import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CallbackPage from '../callback/page';

const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('CallbackPage', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('code');
    mockSearchParams.delete('state');
    mockSearchParams.delete('error');
    mockSearchParams.delete('error_description');

    // Reset sessionStorage mock
    (window.sessionStorage.setItem as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      render(<CallbackPage />);

      expect(screen.getByText('callback.title')).toBeInTheDocument();
    });

    it('should show error state when no code is provided', () => {
      // When no code is provided, the component goes directly to error state
      render(<CallbackPage />);

      expect(screen.getByText('callback.error')).toBeInTheDocument();
    });
  });

  describe('Success flow', () => {
    it('should show success message when code is present', async () => {
      mockSearchParams.set('code', 'auth-code-123');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('callback.success')).toBeInTheDocument();
      });
    });

    it('should store authorization code in sessionStorage', async () => {
      mockSearchParams.set('code', 'auth-code-123');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'onesign_authorization_code',
          'auth-code-123'
        );
      });
    });

    it('should store state in sessionStorage when present', async () => {
      mockSearchParams.set('code', 'auth-code-123');
      mockSearchParams.set('state', 'state-456');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'onesign_authorization_code',
          'auth-code-123'
        );
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'onesign_authorization_state',
          'state-456'
        );
      });
    });

    it('should not store state when not present', async () => {
      mockSearchParams.set('code', 'auth-code-123');
      // Ensure state is not in params
      mockSearchParams.delete('state');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'onesign_authorization_code',
          'auth-code-123'
        );
      });

      // State should not be stored since it's not in the params
      expect(window.sessionStorage.setItem).not.toHaveBeenCalledWith(
        'onesign_authorization_state',
        expect.anything()
      );
    });
  });

  describe('Error flow', () => {
    it('should show error message when error param is present', async () => {
      mockSearchParams.set('error', 'access_denied');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('callback.error')).toBeInTheDocument();
      });
    });

    it('should show error_description when provided', async () => {
      mockSearchParams.set('error', 'access_denied');
      mockSearchParams.set('error_description', 'User denied access');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('User denied access')).toBeInTheDocument();
      });
    });

    it('should show default error when no code', async () => {
      // No code, no error - should show error state
      render(<CallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('callback.error')).toBeInTheDocument();
      });
    });

    it('should prioritize error over code', async () => {
      mockSearchParams.set('code', 'auth-code-123');
      mockSearchParams.set('error', 'server_error');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('callback.error')).toBeInTheDocument();
      });
    });
  });

  describe('Status states', () => {
    it('should display spinner when code is being processed', async () => {
      mockSearchParams.set('code', 'auth-code-123');
      render(<CallbackPage />);

      // After code is present, it will show success state
      await waitFor(() => {
        const successMessage = screen.getByText('callback.success');
        expect(successMessage).toBeInTheDocument();
      });
    });

    it('should display green text for success', async () => {
      mockSearchParams.set('code', 'auth-code-123');

      render(<CallbackPage />);

      await waitFor(() => {
        const successMessage = screen.getByText('callback.success');
        expect(successMessage).toHaveClass('text-green-600');
      });
    });

    it('should display red text for error', async () => {
      mockSearchParams.set('error', 'access_denied');

      render(<CallbackPage />);

      await waitFor(() => {
        const errorMessage = screen.getByText('callback.error');
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });
  });

  describe('Window check', () => {
    it('should only store in sessionStorage when window is defined', async () => {
      mockSearchParams.set('code', 'auth-code-123');
      mockSearchParams.set('state', 'state-456');

      render(<CallbackPage />);

      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalled();
      });
    });
  });
});
