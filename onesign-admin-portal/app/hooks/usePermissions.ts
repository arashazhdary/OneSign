'use client';

import { useAuth } from './useAuth';
import { useMemo } from 'react';

export type Permission = string;
export type Role = 'admin' | 'user' | 'viewer' | 'moderator';

/**
 * Hook for permission checks
 *
 * @example
 * const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = usePermissions();
 *
 * if (hasPermission('users.create')) {
 *   return <CreateUserButton />;
 * }
 *
 * if (hasRole('admin')) {
 *   return <AdminPanel />;
 * }
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  const roles = useMemo(() => {
    return user?.roles || [];
  }, [user?.roles]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionList.some((permission) => permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionList.every((permission) => permissions.includes(permission));
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleList: Role[]): boolean => {
    return roleList.some((role) => roles.includes(role));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roleList: Role[]): boolean => {
    return roleList.every((role) => roles.includes(role));
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
  };
}
