import { OnesignConfig, TokenInfo } from '../types';

describe('types', () => {
  describe('OnesignConfig', () => {
    it('should create valid config with required fields', () => {
      const config: OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client-id',
        redirectUri: 'https://app.example.com/callback',
      };

      expect(config.baseUrl).toBe('https://auth.example.com');
      expect(config.clientId).toBe('test-client-id');
      expect(config.redirectUri).toBe('https://app.example.com/callback');
      expect(config.tenantId).toBeUndefined();
    });

    it('should create valid config with all fields', () => {
      const config: OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client-id',
        redirectUri: 'https://app.example.com/callback',
        tenantId: 'test-tenant-id',
      };

      expect(config.baseUrl).toBe('https://auth.example.com');
      expect(config.clientId).toBe('test-client-id');
      expect(config.redirectUri).toBe('https://app.example.com/callback');
      expect(config.tenantId).toBe('test-tenant-id');
    });

    it('should allow different URL formats', () => {
      const config1: OnesignConfig = {
        baseUrl: 'http://localhost:3000',
        clientId: 'local-client',
        redirectUri: 'http://localhost:3000/callback',
      };

      const config2: OnesignConfig = {
        baseUrl: 'https://auth.company.internal',
        clientId: 'internal-client',
        redirectUri: 'https://app.company.internal/auth/callback',
      };

      expect(config1.baseUrl).toContain('localhost');
      expect(config2.baseUrl).toContain('internal');
    });

    it('should handle empty strings', () => {
      const config: OnesignConfig = {
        baseUrl: '',
        clientId: '',
        redirectUri: '',
      };

      expect(config.baseUrl).toBe('');
      expect(config.clientId).toBe('');
      expect(config.redirectUri).toBe('');
    });

    it('should handle special characters in values', () => {
      const config: OnesignConfig = {
        baseUrl: 'https://auth.example.com/path?query=value',
        clientId: 'client-id-with-special_chars.123',
        redirectUri: 'https://app.example.com/callback#hash',
        tenantId: 'tenant_id-with.special',
      };

      expect(config.clientId).toContain('_');
      expect(config.clientId).toContain('.');
      expect(config.tenantId).toContain('_');
    });
  });

  describe('TokenInfo', () => {
    it('should create valid token info', () => {
      const tokenInfo: TokenInfo = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accesstoken',
        idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.idtoken',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      expect(tokenInfo.accessToken).toBeDefined();
      expect(tokenInfo.idToken).toBeDefined();
      expect(tokenInfo.tokenType).toBe('Bearer');
      expect(tokenInfo.expiresIn).toBe(3600);
    });

    it('should handle different token types', () => {
      const bearerToken: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      const customToken: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Custom',
        expiresIn: 3600,
      };

      expect(bearerToken.tokenType).toBe('Bearer');
      expect(customToken.tokenType).toBe('Custom');
    });

    it('should handle different expiry times', () => {
      const shortLived: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 300, // 5 minutes
      };

      const longLived: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 86400, // 24 hours
      };

      expect(shortLived.expiresIn).toBeLessThan(longLived.expiresIn);
    });

    it('should handle empty token strings', () => {
      const tokenInfo: TokenInfo = {
        accessToken: '',
        idToken: '',
        tokenType: '',
        expiresIn: 0,
      };

      expect(tokenInfo.accessToken).toBe('');
      expect(tokenInfo.idToken).toBe('');
      expect(tokenInfo.tokenType).toBe('');
      expect(tokenInfo.expiresIn).toBe(0);
    });

    it('should handle JWT format tokens', () => {
      const tokenInfo: TokenInfo = {
        accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.signature',
        idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.signature',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      // JWT tokens have three parts separated by dots
      expect(tokenInfo.accessToken.split('.')).toHaveLength(3);
      expect(tokenInfo.idToken.split('.')).toHaveLength(3);
    });

    it('should handle numeric expiry values', () => {
      const tokenInfo: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 7200,
      };

      expect(typeof tokenInfo.expiresIn).toBe('number');
      expect(tokenInfo.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('type compatibility', () => {
    it('should be usable with object spread', () => {
      const config: OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client',
        redirectUri: 'https://app.example.com/callback',
      };

      const extendedConfig = {
        ...config,
        tenantId: 'new-tenant',
      };

      expect(extendedConfig.baseUrl).toBe(config.baseUrl);
      expect(extendedConfig.tenantId).toBe('new-tenant');
    });

    it('should be usable with object destructuring', () => {
      const tokenInfo: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      const { accessToken, idToken, tokenType, expiresIn } = tokenInfo;

      expect(accessToken).toBe('access');
      expect(idToken).toBe('id');
      expect(tokenType).toBe('Bearer');
      expect(expiresIn).toBe(3600);
    });

    it('should be serializable to JSON', () => {
      const config: OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client',
        redirectUri: 'https://app.example.com/callback',
        tenantId: 'test-tenant',
      };

      const tokenInfo: TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      const configJson = JSON.stringify(config);
      const tokenJson = JSON.stringify(tokenInfo);

      expect(JSON.parse(configJson)).toEqual(config);
      expect(JSON.parse(tokenJson)).toEqual(tokenInfo);
    });
  });
});
