import { getCurrentUserScope, CurrentUserScopeDto } from '../users';

describe('users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUserScope', () => {
    it('should fetch and return user scope successfully', async () => {
      const mockScope: CurrentUserScopeDto = {
        userId: 'user-123',
        isGlobalAdmin: true,
        rootOrgUnitIds: ['org-1', 'org-2'],
        allowedOrgUnitIds: ['org-1', 'org-2', 'org-3']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScope)
      });

      const result = await getCurrentUserScope('tenant-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/tenant/users/current/scope?tenantId=tenant-123'
      );
      expect(result).toEqual(mockScope);
    });

    it('should return null when API response is not ok', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      const result = await getCurrentUserScope('tenant-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch current user scope:',
        'Not Found'
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return null when API throws error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      const result = await getCurrentUserScope('tenant-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching current user scope:',
        error
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should handle delegated admin scope correctly', async () => {
      const mockScope: CurrentUserScopeDto = {
        userId: 'user-456',
        isGlobalAdmin: false,
        rootOrgUnitIds: ['org-1'],
        allowedOrgUnitIds: ['org-1', 'org-1-child']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScope)
      });

      const result = await getCurrentUserScope('tenant-456');

      expect(result).toEqual(mockScope);
      expect(result?.isGlobalAdmin).toBe(false);
      expect(result?.rootOrgUnitIds).toHaveLength(1);
    });
  });
});
