import apiClient from '@/services/apiClient';

// Type definitions - Updated based on actual API response
export interface CurrentUserScopeDto {
  userId: string;
  isGlobalAdmin: boolean;
  rootOrgUnitIds: string[];
  allowedOrgUnitIds: string[];
}

// Direct function exports
export const getCurrentUserScope = async (): Promise<CurrentUserScopeDto | null> => {
  try {
    const response = await apiClient.get('/api/tenant/users/current/scope');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user scope:', error);
    return null;
  }
};

// Re-export from main services
export { usersService } from './services';
import { usersService } from './services';
export default usersService;
