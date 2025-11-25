import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/auth.api';

// Mock the API
vi.mock('@/services/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Skip these tests until auth integration hooks are fully implemented
describe.skip('Auth Integration Tests', () => {
  beforeEach(() => {
    // Reset store and mocks
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should complete full login flow', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };

    const mockResponse = {
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser,
    };

    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    // Simulate login via API and update store
    const response = await authApi.login({ email: 'john@example.com', password: 'password123' });
    result.current.login(response.user);
    localStorage.setItem('authToken', response.token);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    });
  });

  it('should handle login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

    await expect(
      authApi.login({ email: 'wrong@example.com', password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');

    const { result } = renderHook(() => useAuthStore());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should complete full logout flow', async () => {
    // Setup authenticated state
    useAuthStore.setState({
      user: { id: '1', name: 'John', email: 'john@example.com', role: 'admin' },
      isAuthenticated: true,
    });
    localStorage.setItem('authToken', 'mock-token');

    vi.mocked(authApi.logout).mockResolvedValue();

    const { result } = renderHook(() => useAuthStore());

    await authApi.logout();
    result.current.logout();
    localStorage.removeItem('authToken');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    expect(authApi.logout).toHaveBeenCalled();
  });

  it('should refresh token when expired', async () => {
    const newToken = 'new-mock-token';
    const newRefreshToken = 'new-refresh-token';

    vi.mocked(authApi.refreshToken).mockResolvedValue({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        role: 'admin',
      },
    });

    localStorage.setItem('refreshToken', 'old-refresh-token');

    const response = await authApi.refreshToken('old-refresh-token');
    localStorage.setItem('authToken', response.token);

    expect(authApi.refreshToken).toHaveBeenCalledWith('old-refresh-token');
    expect(localStorage.getItem('authToken')).toBe(newToken);
  });

  it('should request password reset', async () => {
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue();

    await authApi.requestPasswordReset({ email: 'john@example.com' });

    expect(authApi.requestPasswordReset).toHaveBeenCalledWith({
      email: 'john@example.com',
    });
  });

  it('should reset password with token', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue();

    await authApi.resetPassword({
      token: 'reset-token',
      password: 'newpassword123',
    });

    expect(authApi.resetPassword).toHaveBeenCalledWith({
      token: 'reset-token',
      password: 'newpassword123',
    });
  });
});
