import { useState, useCallback } from 'react';
import { OnesignConfig, TokenInfo } from '../types';
import { generateCodeVerifier, generateCodeChallenge, exchangeCodeForToken } from '../utils/pkce';

export function useOnesignAuth(config: OnesignConfig) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code_verifier in sessionStorage
    sessionStorage.setItem('onesign_code_verifier', codeVerifier);
    
    const baseUrl = config.baseUrl.trimEnd('/');
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (config.tenantId) {
      params.set('tenantId', config.tenantId);
    }

    const authorizeUrl = `${baseUrl}/connect/authorize?${params.toString()}`;
    window.location.href = authorizeUrl;
  }, [config]);

  const logout = useCallback(() => {
    setTokenInfo(null);
    sessionStorage.removeItem('onesign_code_verifier');
    sessionStorage.removeItem('onesign_tokens');
  }, []);

  const handleCallback = useCallback(async (code: string, state?: string): Promise<TokenInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const codeVerifier = sessionStorage.getItem('onesign_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      const tokens = await exchangeCodeForToken(config, code, codeVerifier);
      if (tokens) {
        setTokenInfo(tokens);
        sessionStorage.setItem('onesign_tokens', JSON.stringify(tokens));
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
  }, [config]);

  return {
    login,
    logout,
    handleCallback,
    tokenInfo,
    loading,
    error,
    isAuthenticated: tokenInfo !== null
  };
}

