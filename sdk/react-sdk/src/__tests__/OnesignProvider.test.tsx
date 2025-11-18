import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { OnesignProvider, useOnesign } from '../components/OnesignProvider';
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

describe('OnesignProvider', () => {
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

  describe('rendering', () => {
    it('should render children', () => {
      render(
        <OnesignProvider config={mockConfig}>
          <div data-testid="child">Child Component</div>
        </OnesignProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <OnesignProvider config={mockConfig}>
          <div data-testid="child1">First</div>
          <div data-testid="child2">Second</div>
        </OnesignProvider>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      render(
        <OnesignProvider config={mockConfig}>
          <div data-testid="parent">
            <span data-testid="nested">Nested</span>
          </div>
        </OnesignProvider>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });

    it('should render text content', () => {
      render(
        <OnesignProvider config={mockConfig}>
          Simple text content
        </OnesignProvider>
      );

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render with different config', () => {
      const customConfig: OnesignConfig = {
        baseUrl: 'https://custom.auth.com',
        clientId: 'custom-client',
        redirectUri: 'https://custom.app.com/callback',
        tenantId: 'custom-tenant',
      };

      render(
        <OnesignProvider config={customConfig}>
          <div data-testid="child">Child</div>
        </OnesignProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('context provider', () => {
    it('should provide context to children', () => {
      const TestConsumer: React.FC = () => {
        const auth = useOnesign();
        return <div data-testid="context-check">{auth ? 'Context available' : 'No context'}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByText('Context available')).toBeInTheDocument();
    });

    it('should provide login function', () => {
      const TestConsumer: React.FC = () => {
        const { login } = useOnesign();
        return <button onClick={login}>Login</button>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should provide logout function', () => {
      const TestConsumer: React.FC = () => {
        const { logout } = useOnesign();
        return <button onClick={logout}>Logout</button>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should provide handleCallback function', () => {
      const TestConsumer: React.FC = () => {
        const { handleCallback } = useOnesign();
        return <div data-testid="handler">{typeof handleCallback}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('handler')).toHaveTextContent('function');
    });

    it('should provide initial tokenInfo as null', () => {
      const TestConsumer: React.FC = () => {
        const { tokenInfo } = useOnesign();
        return <div data-testid="token">{tokenInfo ? 'Has token' : 'No token'}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('token')).toHaveTextContent('No token');
    });

    it('should provide initial loading as false', () => {
      const TestConsumer: React.FC = () => {
        const { loading } = useOnesign();
        return <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    it('should provide initial error as null', () => {
      const TestConsumer: React.FC = () => {
        const { error } = useOnesign();
        return <div data-testid="error">{error || 'No error'}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });

    it('should provide initial isAuthenticated as false', () => {
      const TestConsumer: React.FC = () => {
        const { isAuthenticated } = useOnesign();
        return <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('Not authenticated');
    });
  });

  describe('useOnesign hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useOnesign());
      }).toThrow('useOnesign must be used within OnesignProvider');

      consoleSpy.mockRestore();
    });

    it('should not throw when used inside provider', () => {
      const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <OnesignProvider config={mockConfig}>
          {children}
        </OnesignProvider>
      );

      expect(() => {
        renderHook(() => useOnesign(), { wrapper });
      }).not.toThrow();
    });

    it('should return auth context object', () => {
      const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <OnesignProvider config={mockConfig}>
          {children}
        </OnesignProvider>
      );

      const { result } = renderHook(() => useOnesign(), { wrapper });

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('handleCallback');
      expect(result.current).toHaveProperty('tokenInfo');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isAuthenticated');
    });
  });

  describe('state management through context', () => {
    it('should update isAuthenticated after successful callback', async () => {
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';

      const TestConsumer: React.FC = () => {
        const { isAuthenticated, handleCallback } = useOnesign();
        return (
          <div>
            <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
            <button onClick={() => handleCallback('auth-code')}>Authenticate</button>
          </div>
        );
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('Not authenticated');

      await act(async () => {
        screen.getByText('Authenticate').click();
      });

      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');
    });

    it('should clear authentication state on logout', async () => {
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';

      const TestConsumer: React.FC = () => {
        const { isAuthenticated, handleCallback, logout } = useOnesign();
        return (
          <div>
            <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
            <button onClick={() => handleCallback('auth-code')}>Authenticate</button>
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      // First authenticate
      await act(async () => {
        screen.getByText('Authenticate').click();
      });

      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');

      // Then logout
      act(() => {
        screen.getByText('Logout').click();
      });

      expect(screen.getByTestId('auth')).toHaveTextContent('Not authenticated');
    });

    it('should show error state when callback fails', async () => {
      delete mockSessionStorage['onesign_code_verifier'];
      sessionStorageMock.getItem.mockReturnValue(null);

      const TestConsumer: React.FC = () => {
        const { error, handleCallback } = useOnesign();
        return (
          <div>
            <div data-testid="error">{error || 'No error'}</div>
            <button onClick={() => handleCallback('auth-code')}>Authenticate</button>
          </div>
        );
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      await act(async () => {
        screen.getByText('Authenticate').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Code verifier not found');
    });

    it('should display token info when authenticated', async () => {
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';

      const TestConsumer: React.FC = () => {
        const { tokenInfo, handleCallback } = useOnesign();
        return (
          <div>
            <div data-testid="token">{tokenInfo?.accessToken || 'No token'}</div>
            <button onClick={() => handleCallback('auth-code')}>Authenticate</button>
          </div>
        );
      };

      render(
        <OnesignProvider config={mockConfig}>
          <TestConsumer />
        </OnesignProvider>
      );

      expect(screen.getByTestId('token')).toHaveTextContent('No token');

      await act(async () => {
        screen.getByText('Authenticate').click();
      });

      expect(screen.getByTestId('token')).toHaveTextContent('test-access-token');
    });
  });

  describe('nested providers', () => {
    it('should use closest provider context', () => {
      const outerConfig: OnesignConfig = {
        baseUrl: 'https://outer.auth.com',
        clientId: 'outer-client',
        redirectUri: 'https://outer.app.com/callback',
      };

      const innerConfig: OnesignConfig = {
        baseUrl: 'https://inner.auth.com',
        clientId: 'inner-client',
        redirectUri: 'https://inner.app.com/callback',
      };

      // This test verifies that nested providers work without errors
      render(
        <OnesignProvider config={outerConfig}>
          <OnesignProvider config={innerConfig}>
            <div data-testid="nested">Nested content</div>
          </OnesignProvider>
        </OnesignProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('multiple consumers', () => {
    it('should provide same context to all consumers', async () => {
      mockSessionStorage['onesign_code_verifier'] = 'test-verifier';

      const Consumer1: React.FC = () => {
        const { isAuthenticated } = useOnesign();
        return <div data-testid="consumer1">{isAuthenticated ? 'Auth' : 'NoAuth'}</div>;
      };

      const Consumer2: React.FC = () => {
        const { isAuthenticated, handleCallback } = useOnesign();
        return (
          <div>
            <div data-testid="consumer2">{isAuthenticated ? 'Auth' : 'NoAuth'}</div>
            <button onClick={() => handleCallback('auth-code')}>Authenticate</button>
          </div>
        );
      };

      render(
        <OnesignProvider config={mockConfig}>
          <Consumer1 />
          <Consumer2 />
        </OnesignProvider>
      );

      expect(screen.getByTestId('consumer1')).toHaveTextContent('NoAuth');
      expect(screen.getByTestId('consumer2')).toHaveTextContent('NoAuth');

      await act(async () => {
        screen.getByText('Authenticate').click();
      });

      expect(screen.getByTestId('consumer1')).toHaveTextContent('Auth');
      expect(screen.getByTestId('consumer2')).toHaveTextContent('Auth');
    });
  });
});
