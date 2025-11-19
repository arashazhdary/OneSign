import { getTenantBranding, clearBrandingCache, TenantBranding } from '../tenant-branding';

// Reset module state between tests
beforeEach(() => {
  clearBrandingCache();
  jest.clearAllMocks();
});

describe('tenant-branding', () => {
  describe('getTenantBranding', () => {
    it('should fetch tenant branding from API successfully', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#6366f1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranding)
      });

      const result = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/tenant/settings?tenantId=tenant-123'
      );
      expect(result).toEqual(mockBranding);
    });

    it('should return cached branding for same tenant', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#6366f1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranding)
      });

      // First call
      const result1 = await getTenantBranding('tenant-123');
      // Second call - should use cache
      const result2 = await getTenantBranding('tenant-123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockBranding);
      expect(result2).toEqual(mockBranding);
    });

    it('should fetch new branding for different tenant', async () => {
      const mockBranding1 = {
        logoUrl: 'https://example.com/logo1.png',
        primaryColor: '#6366f1'
      };
      const mockBranding2 = {
        logoUrl: 'https://example.com/logo2.png',
        primaryColor: '#ff0000'
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBranding1)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBranding2)
        });

      const result1 = await getTenantBranding('tenant-123');
      const result2 = await getTenantBranding('tenant-456');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result1).toEqual(mockBranding1);
      expect(result2).toEqual(mockBranding2);
    });

    it('should return default branding when API response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getTenantBranding('tenant-123');

      expect(result).toEqual({
        logoUrl: undefined,
        primaryColor: undefined
      });
    });

    it('should return default branding when API throws error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getTenantBranding('tenant-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch tenant branding:',
        expect.any(Error)
      );
      expect(result).toEqual({
        logoUrl: undefined,
        primaryColor: undefined
      });

      consoleSpy.mockRestore();
    });
  });

  describe('clearBrandingCache', () => {
    it('should clear the cached branding', async () => {
      const mockBranding = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#6366f1'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBranding)
      });

      // First call - should fetch
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearBrandingCache();

      // Second call - should fetch again after cache clear
      await getTenantBranding('tenant-123');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
