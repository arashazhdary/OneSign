import { getTenantBranding, clearBrandingCache } from '../tenant-branding';

describe('tenant-branding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearBrandingCache();
  });

  describe('getTenantBranding', () => {
    it('should fetch branding from API', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBranding),
      });

      const result = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/tenant/settings?tenantId=tenant-123'
      );
      expect(result).toEqual(mockBranding);
    });

    it('should cache branding for same tenant', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBranding),
      });

      // First call
      const result1 = await getTenantBranding('tenant-123');
      // Second call should use cache
      const result2 = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
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

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBranding1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBranding2),
        });

      const result1 = await getTenantBranding('tenant-1');
      const result2 = await getTenantBranding('tenant-2');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result1).toEqual(mockBranding1);
      expect(result2).toEqual(mockBranding2);
    });

    it('should return default branding on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual({
        logoUrl: undefined,
        primaryColor: undefined,
      });
    });

    it('should return default branding on fetch exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual({
        logoUrl: undefined,
        primaryColor: undefined,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch tenant branding:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle partial branding data', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        // no primaryColor
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBranding),
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: undefined,
      });
    });

    it('should handle empty branding data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual({
        logoUrl: undefined,
        primaryColor: undefined,
      });
    });
  });

  describe('clearBrandingCache', () => {
    it('should clear cached branding', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF0000',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBranding),
      });

      // First call
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearBrandingCache();

      // Should fetch again
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
