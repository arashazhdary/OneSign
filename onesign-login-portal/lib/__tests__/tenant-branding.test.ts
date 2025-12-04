import {
  getTenantBranding,
  clearBrandingCache,
  getCacheStatus,
  refreshBranding,
  preloadBranding,
  DEFAULT_BRANDING,
} from '../tenant-branding';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
    get store() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('tenant-branding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    clearBrandingCache();
  });

  describe('getTenantBranding', () => {
    it('should fetch branding from API and merge with defaults', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Map([['ETag', 'abc123']]),
        json: () => Promise.resolve(mockBranding),
      });

      const result = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/tenant/branding?tenantId=tenant-123',
        expect.any(Object)
      );

      // Should merge with DEFAULT_BRANDING
      expect(result).toMatchObject({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
        secondaryColor: DEFAULT_BRANDING.secondaryColor,
        accentColor: DEFAULT_BRANDING.accentColor,
      });
    });

    it('should cache branding in memory for same tenant', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      const mockHeaders = new Map([['ETag', 'abc123']]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeaders,
        json: () => Promise.resolve(mockBranding),
      });

      // First call
      const result1 = await getTenantBranding('tenant-123');
      // Second call should use in-memory cache
      const result2 = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toMatchObject(result2);
    });

    it('should store branding in localStorage', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      const mockHeaders = new Map([['ETag', 'etag123']]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeaders,
        json: () => Promise.resolve(mockBranding),
      });

      await getTenantBranding('tenant-123');

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const cacheKey = 'tenant_branding_tenant-123';
      const cached = JSON.parse(localStorageMock.store[cacheKey]);

      expect(cached).toMatchObject({
        version: '1.0',
        tenantId: 'tenant-123',
        etag: 'etag123',
      });
      expect(cached.branding).toMatchObject({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      });
    });

    it('should fetch again for different tenant', async () => {
      const mockBranding1 = {
        logoUrl: 'https://example.com/logo1.png',
        primaryColor: '#FF0000',
      };
      const mockBranding2 = {
        logoUrl: 'https://example.com/logo2.png',
        primaryColor: '#00FF00',
      };

      const mockHeaders = new Map([['ETag', 'abc123']]);
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: mockHeaders,
          json: () => Promise.resolve(mockBranding1),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: mockHeaders,
          json: () => Promise.resolve(mockBranding2),
        });

      const result1 = await getTenantBranding('tenant-1');
      const result2 = await getTenantBranding('tenant-2');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result1).toMatchObject(mockBranding1);
      expect(result2).toMatchObject(mockBranding2);
    });

    it('should return default branding on API error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual(DEFAULT_BRANDING);
      consoleSpy.mockRestore();
    });

    it('should return default branding on fetch exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual(DEFAULT_BRANDING);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch tenant branding:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle partial branding data and merge with defaults', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        // no primaryColor
      };

      const mockHeaders = new Map([['ETag', 'abc123']]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeaders,
        json: () => Promise.resolve(mockBranding),
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toMatchObject({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: DEFAULT_BRANDING.primaryColor,
        secondaryColor: DEFAULT_BRANDING.secondaryColor,
      });
    });

    it('should handle empty branding data and return defaults', async () => {
      const mockHeaders = new Map([['ETag', 'abc123']]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeaders,
        json: () => Promise.resolve({}),
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual(DEFAULT_BRANDING);
    });

    it('should send If-None-Match header with cached ETag', async () => {
      const mockBranding = { primaryColor: '#FF0000' };

      // Mock Headers.get method
      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      // First call - populate cache
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve(mockBranding),
      });

      await getTenantBranding('tenant-123');

      // Simulate expired cache by manipulating timestamp
      const cacheKey = 'tenant_branding_tenant-123';
      const cached = JSON.parse(localStorageMock.store[cacheKey]);
      cached.timestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago (expired)
      localStorageMock.store[cacheKey] = JSON.stringify(cached);

      // Clear in-memory cache to force reading from localStorage
      clearBrandingCache('tenant-123');

      // Restore localStorage entry (clearBrandingCache removes it)
      localStorageMock.store[cacheKey] = JSON.stringify(cached);

      // Mock 304 Not Modified response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 304,
      });

      // Second call should send If-None-Match header because cache is expired
      await getTenantBranding('tenant-123');

      // Wait for background refresh to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that If-None-Match was sent in background refresh
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]?.headers?.['If-None-Match']).toBe('etag123');
    });
  });

  describe('clearBrandingCache', () => {
    it('should clear in-memory and localStorage cache', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve(mockBranding),
      });

      // First call
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Clear cache
      clearBrandingCache('tenant-123');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'tenant_branding_tenant-123'
      );

      // Should fetch again
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should clear all caches when no tenant specified', async () => {
      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve({}),
      });

      // Create caches for multiple tenants
      await getTenantBranding('tenant-1');
      await getTenantBranding('tenant-2');

      // Verify caches exist
      expect(localStorageMock.store['tenant_branding_tenant-1']).toBeDefined();
      expect(localStorageMock.store['tenant_branding_tenant-2']).toBeDefined();

      // Clear all caches
      clearBrandingCache();

      // Verify caches were removed
      expect(localStorageMock.store['tenant_branding_tenant-1']).toBeUndefined();
      expect(localStorageMock.store['tenant_branding_tenant-2']).toBeUndefined();
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status for existing cache', async () => {
      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve({ primaryColor: '#FF0000' }),
      });

      await getTenantBranding('tenant-123');

      const status = getCacheStatus('tenant-123');

      expect(status.exists).toBe(true);
      expect(status.expired).toBe(false);
      expect(status.version).toBe('1.0');
      expect(typeof status.age).toBe('number');
    });

    it('should return no cache for non-existent tenant', () => {
      const status = getCacheStatus('non-existent');

      expect(status.exists).toBe(false);
      expect(status.expired).toBe(false);
    });
  });

  describe('refreshBranding', () => {
    it('should clear cache and fetch fresh data', async () => {
      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve({ primaryColor: '#FF0000' }),
      });

      // Initial fetch
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Refresh should clear and re-fetch
      await refreshBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('preloadBranding', () => {
    it('should preload branding without errors', async () => {
      const mockHeadersObj = {
        get: jest.fn((key: string) => (key === 'ETag' ? 'etag123' : null)),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: mockHeadersObj,
        json: () => Promise.resolve({ primaryColor: '#FF0000' }),
      });

      await preloadBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const status = getCacheStatus('tenant-123');
      expect(status.exists).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await preloadBranding('tenant-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
