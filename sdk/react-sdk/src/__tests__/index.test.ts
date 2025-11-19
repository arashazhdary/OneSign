import * as OnesignReactSDK from '../index';
import { useOnesignAuth } from '../hooks/useOnesignAuth';
import { OnesignProvider } from '../components/OnesignProvider';

describe('index exports', () => {
  describe('named exports', () => {
    it('should export useOnesignAuth hook', () => {
      expect(OnesignReactSDK.useOnesignAuth).toBeDefined();
      expect(typeof OnesignReactSDK.useOnesignAuth).toBe('function');
    });

    it('should export OnesignProvider component', () => {
      expect(OnesignReactSDK.OnesignProvider).toBeDefined();
      expect(typeof OnesignReactSDK.OnesignProvider).toBe('function');
    });

    it('should export the same useOnesignAuth as direct import', () => {
      expect(OnesignReactSDK.useOnesignAuth).toBe(useOnesignAuth);
    });

    it('should export the same OnesignProvider as direct import', () => {
      expect(OnesignReactSDK.OnesignProvider).toBe(OnesignProvider);
    });
  });

  describe('type exports', () => {
    it('should allow importing OnesignConfig type', () => {
      // This is a compile-time check that will fail if the type is not exported
      // At runtime, we just verify the module loads correctly
      const config: OnesignReactSDK.OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client',
        redirectUri: 'https://app.example.com/callback',
      };

      expect(config.baseUrl).toBe('https://auth.example.com');
      expect(config.clientId).toBe('test-client');
      expect(config.redirectUri).toBe('https://app.example.com/callback');
    });

    it('should allow importing TokenInfo type', () => {
      // This is a compile-time check that will fail if the type is not exported
      const tokenInfo: OnesignReactSDK.TokenInfo = {
        accessToken: 'access',
        idToken: 'id',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      expect(tokenInfo.accessToken).toBe('access');
      expect(tokenInfo.idToken).toBe('id');
      expect(tokenInfo.tokenType).toBe('Bearer');
      expect(tokenInfo.expiresIn).toBe(3600);
    });

    it('should allow OnesignConfig with optional tenantId', () => {
      const configWithTenant: OnesignReactSDK.OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client',
        redirectUri: 'https://app.example.com/callback',
        tenantId: 'test-tenant',
      };

      const configWithoutTenant: OnesignReactSDK.OnesignConfig = {
        baseUrl: 'https://auth.example.com',
        clientId: 'test-client',
        redirectUri: 'https://app.example.com/callback',
      };

      expect(configWithTenant.tenantId).toBe('test-tenant');
      expect(configWithoutTenant.tenantId).toBeUndefined();
    });
  });

  describe('module structure', () => {
    it('should export exactly the expected items', () => {
      const exportedKeys = Object.keys(OnesignReactSDK);

      // Should export useOnesignAuth and OnesignProvider
      expect(exportedKeys).toContain('useOnesignAuth');
      expect(exportedKeys).toContain('OnesignProvider');

      // Types are not runtime exports, so they won't appear in Object.keys
      expect(exportedKeys.length).toBe(2);
    });

    it('should not export internal utilities', () => {
      const exportedKeys = Object.keys(OnesignReactSDK);

      // These internal items should not be exported
      expect(exportedKeys).not.toContain('generateCodeVerifier');
      expect(exportedKeys).not.toContain('generateCodeChallenge');
      expect(exportedKeys).not.toContain('exchangeCodeForToken');
      expect(exportedKeys).not.toContain('useOnesign');
    });
  });

  describe('usage patterns', () => {
    it('should allow destructured import pattern', () => {
      const { useOnesignAuth: hook, OnesignProvider: Provider } = OnesignReactSDK;

      expect(hook).toBeDefined();
      expect(Provider).toBeDefined();
    });

    it('should allow namespace import pattern', () => {
      expect(OnesignReactSDK.useOnesignAuth).toBeDefined();
      expect(OnesignReactSDK.OnesignProvider).toBeDefined();
    });
  });
});
