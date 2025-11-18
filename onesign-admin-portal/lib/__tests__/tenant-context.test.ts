import { getTenantId, setTenantId } from '../tenant-context';

describe('tenant-context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    });
  });

  describe('getTenantId', () => {
    it('should return tenant ID from URL query parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?tenantId=url-tenant-123'
        },
        writable: true
      });

      const result = getTenantId();

      expect(result).toBe('url-tenant-123');
    });

    it('should return tenant ID from sessionStorage when not in URL', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce('session-tenant-123');

      const result = getTenantId();

      expect(result).toBe('session-tenant-123');
    });

    it('should return tenant ID from localStorage when not in URL or sessionStorage', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('local-tenant-123');

      const result = getTenantId();

      expect(result).toBe('local-tenant-123');
    });

    it('should prioritize URL over storage', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?tenantId=url-tenant-123'
        },
        writable: true
      });
      (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce('session-tenant-123');
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('local-tenant-123');

      const result = getTenantId();

      expect(result).toBe('url-tenant-123');
    });

    it('should prioritize sessionStorage over localStorage', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce('session-tenant-123');
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('local-tenant-123');

      const result = getTenantId();

      expect(result).toBe('session-tenant-123');
    });

    it('should return null when no tenant ID is available', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const result = getTenantId();

      expect(result).toBeNull();
    });
  });

  describe('setTenantId', () => {
    it('should set tenant ID in both sessionStorage and localStorage', () => {
      setTenantId('new-tenant-123');

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('tenantId', 'new-tenant-123');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('tenantId', 'new-tenant-123');
    });
  });
});
