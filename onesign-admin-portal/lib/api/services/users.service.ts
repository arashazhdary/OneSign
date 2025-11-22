import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  User,
  GetUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  InviteUserResponse,
  UserInvitation,
  AssignRoleRequest,
  RemoveRoleRequest,
  UserActivity,
  GetUserActivityParams,
  UserScope,
  BulkInviteRequest,
  BulkInviteResponse,
  UserPreferences,
} from '../types/users';

/**
 * Users Service
 * Handles all user management operations
 */
export class UsersService {
  constructor(private client: ApiClient = apiClient) {}

  /**
   * Get paginated list of users
   */
  async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/api/tenant/users', params);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(tenantId: string, userId: string): Promise<User> {
    const response = await this.client.get<User>(`/api/tenant/users/${userId}`, { tenantId });
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.client.post<User>('/api/tenant/users', data);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(tenantId: string, userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<User>(`/api/tenant/users/${userId}`, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(tenantId: string, userId: string): Promise<void> {
    await this.client.delete(`/api/tenant/users/${userId}`, {
      params: { tenantId },
    });
  }

  /**
   * Suspend user account
   */
  async suspendUser(tenantId: string, userId: string, reason?: string): Promise<void> {
    await this.client.post(`/api/tenant/users/${userId}/suspend`, {
      tenantId,
      reason,
    });
  }

  /**
   * Activate user account
   */
  async activateUser(tenantId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/users/${userId}/activate`, { tenantId });
  }

  // User Invitations

  /**
   * Invite user to tenant
   */
  async inviteUser(data: InviteUserRequest): Promise<InviteUserResponse> {
    const response = await this.client.post<InviteUserResponse>('/api/tenant/users/invite', data);
    return response.data;
  }

  /**
   * Bulk invite users
   */
  async bulkInviteUsers(data: BulkInviteRequest): Promise<BulkInviteResponse> {
    const response = await this.client.post<BulkInviteResponse>(
      '/api/tenant/users/bulk-invite',
      data
    );
    return response.data;
  }

  /**
   * Get user invitations
   */
  async getInvitations(tenantId: string, status?: string): Promise<UserInvitation[]> {
    const response = await this.client.get<UserInvitation[]>('/api/tenant/users/invitations', {
      tenantId,
      status,
    });
    return response.data;
  }

  /**
   * Cancel user invitation
   */
  async cancelInvitation(tenantId: string, invitationId: string): Promise<void> {
    await this.client.post(`/api/tenant/users/invitations/${invitationId}/cancel`, { tenantId });
  }

  /**
   * Resend user invitation
   */
  async resendInvitation(tenantId: string, invitationId: string): Promise<void> {
    await this.client.post(`/api/tenant/users/invitations/${invitationId}/resend`, { tenantId });
  }

  /**
   * Accept user invitation
   */
  async acceptInvitation(invitationId: string, password: string): Promise<User> {
    const response = await this.client.post<User>(
      `/api/tenant/users/invitations/${invitationId}/accept`,
      { password }
    );
    return response.data;
  }

  // Role Management

  /**
   * Assign role to user
   */
  async assignRole(tenantId: string, data: AssignRoleRequest): Promise<void> {
    await this.client.post('/api/tenant/users/roles/assign', {
      ...data,
      tenantId,
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(tenantId: string, data: RemoveRoleRequest): Promise<void> {
    await this.client.post('/api/tenant/users/roles/remove', {
      ...data,
      tenantId,
    });
  }

  /**
   * Get user roles
   */
  async getUserRoles(tenantId: string, userId: string): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/roles`, { tenantId });
    return response.data;
  }

  // User Scope

  /**
   * Get current user scope
   */
  async getCurrentUserScope(tenantId: string): Promise<UserScope> {
    const response = await this.client.get<UserScope>('/api/tenant/users/current/scope', {
      tenantId,
    });
    return response.data;
  }

  /**
   * Get user scope by user ID
   */
  async getUserScope(tenantId: string, userId: string): Promise<UserScope> {
    const response = await this.client.get<UserScope>(`/api/tenant/users/${userId}/scope`, {
      tenantId,
    });
    return response.data;
  }

  // User Activity

  /**
   * Get user activity log
   */
  async getUserActivity(params: GetUserActivityParams): Promise<PaginatedResponse<UserActivity>> {
    const response = await this.client.get<PaginatedResponse<UserActivity>>(
      `/api/tenant/users/${params.userId}/activity`,
      params
    );
    return response.data;
  }

  /**
   * Export user activity
   */
  async exportUserActivity(
    tenantId: string,
    userId: string,
    format: 'csv' | 'xlsx' | 'json'
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(
      `/api/tenant/users/${userId}/activity/export`,
      {
        tenantId,
        format,
      }
    );
    return response.data;
  }

  // User Preferences

  /**
   * Get user preferences
   */
  async getUserPreferences(tenantId: string, userId: string): Promise<UserPreferences> {
    const response = await this.client.get<UserPreferences>(
      `/api/tenant/users/${userId}/preferences`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    tenantId: string,
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await this.client.put<UserPreferences>(
      `/api/tenant/users/${userId}/preferences`,
      { ...preferences, tenantId }
    );
    return response.data;
  }

  // Password Management

  /**
   * Reset user password (admin action)
   */
  async resetUserPassword(tenantId: string, userId: string, sendEmail?: boolean): Promise<void> {
    await this.client.post(`/api/tenant/users/${userId}/reset-password`, {
      tenantId,
      sendEmail,
    });
  }

  /**
   * Force user to change password on next login
   */
  async forcePasswordChange(tenantId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/users/${userId}/force-password-change`, { tenantId });
  }

  // User Search

  /**
   * Search users
   */
  async searchUsers(tenantId: string, query: string): Promise<User[]> {
    const response = await this.client.get<User[]>('/api/tenant/users/search', {
      tenantId,
      query,
    });
    return response.data;
  }

  /**
   * Get users by email
   */
  async getUsersByEmail(tenantId: string, emails: string[]): Promise<User[]> {
    const response = await this.client.post<User[]>('/api/tenant/users/by-email', {
      tenantId,
      emails,
    });
    return response.data;
  }

  // Export/Import

  /**
   * Export users
   */
  async exportUsers(
    tenantId: string,
    format: 'csv' | 'xlsx' | 'json',
    filters?: any
  ): Promise<Blob> {
    const response = await this.client.get<Blob>('/api/tenant/users/export', {
      tenantId,
      format,
      ...filters,
    });
    return response.data;
  }

  /**
   * Import users
   */
  async importUsers(tenantId: string, file: File): Promise<BulkInviteResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);

    const response = await this.client.post<BulkInviteResponse>('/api/tenant/users/import', formData);
    return response.data;
  }

  /**
   * Update user status (enable/disable)
   */
  async updateUserStatus(tenantId: string, userId: string): Promise<void> {
    await this.client.patch(`/api/tenant/users/${userId}/status`, { tenantId });
  }

  /**
   * Get user's org units
   */
  async getUserOrgUnits(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get(`/api/tenant/users/${userId}/org-units`, { tenantId });
    return response.data;
  }

  /**
   * Update user's org units
   */
  async updateUserOrgUnits(
    tenantId: string,
    userId: string,
    primaryOrgUnitId: string,
    secondaryOrgUnitIds: string[]
  ): Promise<void> {
    await this.client.put(`/api/tenant/users/${userId}/org-units`, {
      tenantId,
      primaryOrgUnitId,
      secondaryOrgUnitIds,
    });
  }

  // Account Management

  /**
   * Get current user's account profile
   */
  async getAccountProfile(tenantId: string): Promise<any> {
    const response = await this.client.get('/api/tenant/account/profile', { tenantId });
    return response.data;
  }

  /**
   * Update current user's account profile
   */
  async updateAccountProfile(tenantId: string, data: any): Promise<any> {
    const response = await this.client.put('/api/tenant/account/profile', {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Get current user's active sessions
   */
  async getAccountSessions(tenantId: string): Promise<any[]> {
    const response = await this.client.get('/api/tenant/account/sessions', { tenantId });
    return response.data;
  }

  /**
   * Change current user's password
   */
  async changePassword(tenantId: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/api/tenant/account/change-password', {
      tenantId,
      currentPassword,
      newPassword,
    });
  }

  /**
   * Revoke a user session
   */
  async revokeSession(tenantId: string, sessionId: string): Promise<void> {
    await this.client.delete(`/api/tenant/account/sessions/${sessionId}`, {
      params: { tenantId },
    });
  }

  // User Profile Details

  /**
   * Get user profile
   */
  async getUserProfile(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get(`/api/tenant/users/${userId}/profile`, { tenantId });
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(tenantId: string, userId: string, data: any): Promise<any> {
    const response = await this.client.put(`/api/tenant/users/${userId}/profile`, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Get user activities
   */
  async getUserActivities(tenantId: string, userId: string, pageSize?: number): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/activities`, {
      tenantId,
      pageSize,
    });
    return response.data;
  }

  /**
   * Get user lifecycle events
   */
  async getUserLifecycle(tenantId: string, userId: string): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/lifecycle`, { tenantId });
    return response.data;
  }

  /**
   * Get user risk assessment
   */
  async getUserRiskAssessment(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get(`/api/tenant/users/${userId}/risk-assessment`, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Get user access packages
   */
  async getUserAccessPackages(tenantId: string, userId: string): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/access-packages`, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Get user privileged sessions
   */
  async getUserPrivilegedSessions(tenantId: string, userId: string): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/privileged-sessions`, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Get user audit trail
   */
  async getUserAuditTrail(tenantId: string, userId: string, pageSize?: number): Promise<any[]> {
    const response = await this.client.get(`/api/tenant/users/${userId}/audit-trail`, {
      tenantId,
      pageSize,
    });
    return response.data;
  }
}

// Export singleton instance
export const usersService = new UsersService();
