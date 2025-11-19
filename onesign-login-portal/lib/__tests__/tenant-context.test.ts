import { getTenantId, setTenantId } from '../tenant-context';

describe('tenant-context', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    // Restore window.location
    delete (window as any).location;
    window.location = originalLocation;
  });

  describe('getTenantId', () => {
    it('should return tenantId from URL query parameter', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '?tenantId=url-tenant-id',
        hostname: 'localhost',
      } as Location;

      const result = getTenantId();

      expect(result).toBe('url-tenant-id');
    });

    it('should return tenantId from sessionStorage when not in URL', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '',
        hostname: 'localhost',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue('session-tenant-id');

      const result = getTenantId();

      expect(result).toBe('session-tenant-id');
    });

    it('should return tenantId from localStorage when not in URL or sessionStorage', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '',
        hostname: 'localhost',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValue('local-tenant-id');

      const result = getTenantId();

      expect(result).toBe('local-tenant-id');
    });

    it('should prioritize URL over storage', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '?tenantId=url-tenant-id',
        hostname: 'localhost',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue('session-tenant-id');
      (window.localStorage.getItem as jest.Mock).mockReturnValue('local-tenant-id');

      const result = getTenantId();

      expect(result).toBe('url-tenant-id');
    });

    it('should return null when no tenant ID is available', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '',
        hostname: 'localhost',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = getTenantId();

      expect(result).toBeNull();
    });

    it('should return null for subdomain with more than 2 parts', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '',
        hostname: 'tenant1.onesign.com',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = getTenantId();

      // Returns null as subdomain lookup is placeholder in Phase 1
      expect(result).toBeNull();
    });

    it('should handle hostname with exactly 2 parts', () => {
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '',
        hostname: 'onesign.com',
      } as Location;

      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = getTenantId();

      expect(result).toBeNull();
    });
  });

  describe('setTenantId', () => {
    it('should store tenantId in sessionStorage and localStorage', () => {
      setTenantId('new-tenant-id');

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('tenantId', 'new-tenant-id');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('tenantId', 'new-tenant-id');
    });

    it('should overwrite existing tenantId', () => {
      setTenantId('first-tenant');
      setTenantId('second-tenant');

      expect(window.sessionStorage.setItem).toHaveBeenLastCalledWith('tenantId', 'second-tenant');
      expect(window.localStorage.setItem).toHaveBeenLastCalledWith('tenantId', 'second-tenant');
    });
  });
});
