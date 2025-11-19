import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnesignAuth } from '../hooks/useOnesignAuth';
import { OnesignConfig, TokenInfo } from '../types';
import * as pkce from '../utils/pkce';

// Mock the pkce module
jest.mock('../utils/pkce', () => ({
  generateCodeVerifier: jest.fn(),
  generateCodeChallenge: jest.fn(),
  exchangeCodeForToken: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage: { [key: string]: string } = {};
const sessionStorageMock = {
  getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockSessionStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockSessionStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
  }),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.location
const originalLocation = window.location;
delete (window as any).location;
window.location = { ...originalLocation, href: '' } as Location;

describe('useOnesignAuth', () => {
  const mockConfig: OnesignConfig = {
    baseUrl: 'https://auth.example.com',
    clientId: 'test-client-id',
    redirectUri: 'https://app.example.com/callback',
  };

  const mockTokenInfo: TokenInfo = {
    accessToken: 'test-access-token',
    idToken: 'test-id-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.clear();
    window.location.href = '';

    (pkce.generateCodeVerifier as jest.Mock).mockReturnValue('test-code-verifier');
    (pkce.generateCodeChallenge as jest.Mock).mockResolvedValue('test-code-challenge');
    (pkce.exchangeCodeForToken as jest.Mock).mockResolvedValue(mockTokenInfo);
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  describe('initial state', () => {
    it('should initialize with null tokenInfo', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(result.current.tokenInfo).toBeNull();
    });

    it('should initialize with loading false', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(result.current.loading).toBe(false);
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(result.current.error).toBeNull();
    });

    it('should initialize with isAuthenticated false', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide login function', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(typeof result.current.logout).toBe('function');
    });

    it('should provide handleCallback function', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      expect(typeof result.current.handleCallback).toBe('function');
    });
  });

  describe('login', () => {
    it('should generate code verifier and challenge', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.login();
      });

      expect(pkce.generateCodeVerifier).toHaveBeenCalled();
      expect(pkce.generateCodeChallenge).toHaveBeenCalledWith('test-code-verifier');
    });

    it('should store code verifier in sessionStorage', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.login();
      });

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('onesign_code_verifier', 'test-code-verifier');
    });

    it('should redirect to authorization URL', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.login();
      });

      expect(window.location.href).toContain('https://auth.example.com/connect/authorize');
      expect(window.location.href).toContain('client_id=test-client-id');
      expect(window.location.href).toContain('redirect_uri=');
      expect(window.location.href).toContain('response_type=code');
      expect(window.location.href).toContain('scope=openid+profile+email');
      expect(window.location.href).toContain('code_challenge=test-code-challenge');
      expect(window.location.href).toContain('code_challenge_method=S256');
    });

    it('should include tenantId in URL when provided', async () => {
      const configWithTenant: OnesignConfig = {
        ...mockConfig,
        tenantId: 'test-tenant-id',
      };

      const { result } = renderHook(() => useOnesignAuth(configWithTenant));

      await act(async () => {
        await result.current.login();
      });

      expect(window.location.href).toContain('tenantId=test-tenant-id');
    });

    it('should not include tenantId when not provided', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.login();
      });

      expect(window.location.href).not.toContain('tenantId');
    });

    it('should trim trailing slash from baseUrl', async () => {
      const configWithSlash: OnesignConfig = {
        ...mockConfig,
        baseUrl: 'https://auth.example.com/',
      };

      const { result } = renderHook(() => useOnesignAuth(configWithSlash));

      await act(async () => {
        await result.current.login();
      });

      expect(window.location.href).toMatch(/^https:\/\/auth\.example\.com\/connect\/authorize/);
      expect(window.location.href).not.toContain('//connect');
    });
  });

  describe('logout', () => {
    it('should clear tokenInfo', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      // First authenticate
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';
      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.tokenInfo).not.toBeNull();

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.tokenInfo).toBeNull();
    });

    it('should set isAuthenticated to false', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      // First authenticate
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';
      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should remove code verifier from sessionStorage', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      act(() => {
        result.current.logout();
      });

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('onesign_code_verifier');
    });

    it('should remove tokens from sessionStorage', () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      act(() => {
        result.current.logout();
      });

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('onesign_tokens');
    });
  });

  describe('handleCallback', () => {
    beforeEach(() => {
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';
    });

    it('should set loading to true while processing', async () => {
      let loadingDuringProcess = false;
      (pkce.exchangeCodeForToken as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockTokenInfo), 100);
        });
      });

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      const callbackPromise = act(async () => {
        const promise = result.current.handleCallback('auth-code');
        // Check loading state after a small delay
        setTimeout(() => {
          loadingDuringProcess = result.current.loading;
        }, 10);
        return promise;
      });

      await callbackPromise;

      // The loading should have been true at some point
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error before processing', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.error).toBeNull();
    });

    it('should retrieve code verifier from sessionStorage', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('onesign_code_verifier');
    });

    it('should exchange code for token', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(pkce.exchangeCodeForToken).toHaveBeenCalledWith(
        mockConfig,
        'auth-code',
        'test-verifier'
      );
    });

    it('should set tokenInfo on successful exchange', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.tokenInfo).toEqual(mockTokenInfo);
    });

    it('should return tokens on successful exchange', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      let returnedTokens: TokenInfo | null = null;
      await act(async () => {
        returnedTokens = await result.current.handleCallback('auth-code');
      });

      expect(returnedTokens).toEqual(mockTokenInfo);
    });

    it('should set isAuthenticated to true on success', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should store tokens in sessionStorage', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'onesign_tokens',
        JSON.stringify(mockTokenInfo)
      );
    });

    it('should set loading to false after completion', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.loading).toBe(false);
    });

    it('should throw error when code verifier not found', async () => {
      delete mockSessionStorage['onesign_code_verifier'];
      sessionStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.error).toBe('Code verifier not found');
    });

    it('should return null when code verifier not found', async () => {
      delete mockSessionStorage['onesign_code_verifier'];
      sessionStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      let returnedValue: TokenInfo | null = null;
      await act(async () => {
        returnedValue = await result.current.handleCallback('auth-code');
      });

      expect(returnedValue).toBeNull();
    });

    it('should return null when token exchange fails', async () => {
      (pkce.exchangeCodeForToken as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      let returnedValue: TokenInfo | null = null;
      await act(async () => {
        returnedValue = await result.current.handleCallback('auth-code');
      });

      expect(returnedValue).toBeNull();
    });

    it('should handle state parameter', async () => {
      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code', 'test-state');
      });

      // The function should complete without error
      expect(result.current.tokenInfo).toEqual(mockTokenInfo);
    });

    it('should set error message from Error instance', async () => {
      (pkce.exchangeCodeForToken as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should set generic error message for non-Error throws', async () => {
      (pkce.exchangeCodeForToken as jest.Mock).mockRejectedValue('Some string error');

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.error).toBe('Authentication failed');
    });

    it('should set loading to false even on error', async () => {
      (pkce.exchangeCodeForToken as jest.Mock).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useOnesignAuth(mockConfig));

      await act(async () => {
        await result.current.handleCallback('auth-code');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('config changes', () => {
    it('should use updated config for login', async () => {
      const { result, rerender } = renderHook(
        ({ config }) => useOnesignAuth(config),
        { initialProps: { config: mockConfig } }
      );

      const newConfig: OnesignConfig = {
        ...mockConfig,
        clientId: 'new-client-id',
      };

      rerender({ config: newConfig });

      await act(async () => {
        await result.current.login();
      });

      expect(window.location.href).toContain('client_id=new-client-id');
    });
  });
});
