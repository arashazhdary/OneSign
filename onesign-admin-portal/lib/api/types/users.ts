import { PaginatedResponse, PaginationParams, AuditFields, Status } from './common';

/**
 * User related types
 */

export interface User extends AuditFields {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  title?: string;
  department?: string;
  manager?: string;
  status: Status;
  isEmailVerified: boolean;
  lastSignInAt?: string;
  roles: UserRole[];
  permissions: string[];
  mfaEnabled: boolean;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

export interface UserRole {
  roleId: string;
  roleName: string;
  scopeType: 'global' | 'tenant' | 'orgunit';
  scopeId?: string;
  assignedAt: string;
  assignedByUserId: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  channels: string[];
}

export interface GetUsersParams extends PaginationParams {
  tenantId: string;
  status?: Status;
  role?: string;
  department?: string;
  search?: string;
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  department?: string;
  roleIds: string[];
  sendInvitation?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  department?: string;
  manager?: string;
  metadata?: Record<string, any>;
}

export interface InviteUserRequest {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  message?: string;
  expiresInDays?: number;
}

export interface InviteUserResponse {
  invitationId: string;
  email: string;
  expiresAt: string;
  invitationUrl: string;
}

export interface UserInvitation {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedByUserId: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
  scopeType: 'global' | 'tenant' | 'orgunit';
  scopeId?: string;
}

export interface RemoveRoleRequest {
  userId: string;
  roleId: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface GetUserActivityParams extends PaginationParams {
  userId: string;
  tenantId: string;
  from?: string;
  to?: string;
  action?: string;
  resourceType?: string;
}

export interface UserScope {
  userId: string;
  isGlobalAdmin: boolean;
  rootOrgUnitIds: string[];
  allowedOrgUnitIds: string[];
  permissions: string[];
}

export interface BulkInviteRequest {
  tenantId: string;
  users: Array<{
    email: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
  }>;
  message?: string;
}

export interface BulkInviteResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    email: string;
    success: boolean;
    invitationId?: string;
    error?: string;
  }>;
}
