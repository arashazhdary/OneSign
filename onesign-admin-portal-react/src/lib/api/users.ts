import apiClient from '@/services/apiClient';

// Type definitions
export interface CurrentUserScopeDto {
  userId: string;
  tenantId: string;
  orgUnits: string[];
  permissions: string[];
  roles: string[];
}

// Direct function exports
export const getCurrentUserScope = async (): Promise<CurrentUserScopeDto | null> => {
  try {
    const response = await apiClient.get('/api/users/me/scope');
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
