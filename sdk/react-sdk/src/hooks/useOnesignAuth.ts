import { useState, useCallback, useEffect, useRef } from 'react';
import { OnesignConfig, TokenInfo, UserInfo } from '../types';
import { generateCodeVerifier, generateCodeChallenge, exchangeCodeForToken } from '../utils/pkce';
import { TokenStorage, createTokenStorage } from '../utils/tokenStorage';
import { fetchUserInfo, hasPermission, hasRole } from '../utils/userInfo';
import { refreshTokenSilently, scheduleTokenRefresh } from '../utils/silentRefresh';

export function useOnesignAuth(config: OnesignConfig) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageRef = useRef<TokenStorage>(
    createTokenStorage({
      type: config.storageType || 'sessionStorage',
      prefix: config.storagePrefix
    })
  );

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storage = storageRef.current;
    const storedTokens = storage.getTokens();
    const storedUser = storage.getUser();

    if (storedTokens) {
      setTokenInfo(storedTokens);
      if (storedUser) {
        setUser(storedUser);
      } else {
        fetchUserInfo(config, storedTokens).then((userInfo) => {
          if (userInfo) {
            setUser(userInfo);
            storage.setUser(userInfo);
          }
        });
      }

      if (config.autoRefresh !== false) {
        setupAutoRefresh(storedTokens);
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [config]);

  const setupAutoRefresh = useCallback((tokens: TokenInfo) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = scheduleTokenRefresh(
      tokens,
      async () => {
        const newTokens = await refreshTokenSilently(config, {
          refreshToken: tokens.refreshToken
        });

        if (newTokens) {
          setTokenInfo(newTokens);
          storageRef.current.setTokens(newTokens);

          const userInfo = await fetchUserInfo(config, newTokens);
          if (userInfo) {
            setUser(userInfo);
            storageRef.current.setUser(userInfo);
          }

          if (config.autoRefresh !== false) {
            setupAutoRefresh(newTokens);
          }
        }

        return newTokens;
      },
      (err) => {
        setError(err.message);
      }
    );
  }, [config]);

  const login = useCallback(async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    storageRef.current.setCodeVerifier(codeVerifier);

    const baseUrl = config.baseUrl.replace(/\/+$/, '');
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid profile email offline_access',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (config.tenantId) {
      params.set('tenantId', config.tenantId);
    }

    const authorizeUrl = `${baseUrl}/connect/authorize?${params.toString()}`;
    window.location.href = authorizeUrl;
  }, [config]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    setTokenInfo(null);
    setUser(null);
    setError(null);
    storageRef.current.clearAll();

    if (tokenInfo) {
      const baseUrl = config.baseUrl.replace(/\/+$/, '');
      const params = new URLSearchParams({
        post_logout_redirect_uri: config.redirectUri,
        client_id: config.clientId
      });

      if (tokenInfo.idToken) {
        params.set('id_token_hint', tokenInfo.idToken);
      }

      window.location.href = `${baseUrl}/connect/endsession?${params.toString()}`;
    }
  }, [config, tokenInfo]);

  const handleCallback = useCallback(async (code: string, state?: string): Promise<TokenInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const codeVerifier = storageRef.current.getCodeVerifier();
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      const tokens = await exchangeCodeForToken(config, code, codeVerifier);
      if (tokens) {
        setTokenInfo(tokens);
        storageRef.current.setTokens(tokens);
        storageRef.current.clearCodeVerifier();

        const userInfo = await fetchUserInfo(config, tokens);
        if (userInfo) {
          setUser(userInfo);
          storageRef.current.setUser(userInfo);
        }

        if (config.autoRefresh !== false) {
          setupAutoRefresh(tokens);
        }

        return tokens;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [config, setupAutoRefresh]);

  const refreshToken = useCallback(async (): Promise<TokenInfo | null> => {
    if (!tokenInfo?.refreshToken) {
      setError('No refresh token available');
      return null;
    }

    setLoading(true);
    try {
      const newTokens = await refreshTokenSilently(config, {
        refreshToken: tokenInfo.refreshToken
      });

      if (newTokens) {
        setTokenInfo(newTokens);
        storageRef.current.setTokens(newTokens);

        const userInfo = await fetchUserInfo(config, newTokens);
        if (userInfo) {
          setUser(userInfo);
          storageRef.current.setUser(userInfo);
        }

        if (config.autoRefresh !== false) {
          setupAutoRefresh(newTokens);
        }

        return newTokens;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token refresh failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [config, tokenInfo, setupAutoRefresh]);

  const getAccessToken = useCallback((): string | null => {
    return tokenInfo?.accessToken || null;
  }, [tokenInfo]);

  const checkPermission = useCallback((permission: string): boolean => {
    return hasPermission(user, permission);
  }, [user]);

  const checkRole = useCallback((role: string): boolean => {
    return hasRole(user, role);
  }, [user]);

  return {
    login,
    logout,
    handleCallback,
    refreshToken,
    getAccessToken,
    checkPermission,
    checkRole,
    tokenInfo,
    user,
    loading,
    error,
    isAuthenticated: tokenInfo !== null
  };
}

