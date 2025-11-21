'use client';

import { useCallback } from 'react';
import { useApi } from './useApi';
import * as usersApi from '@/lib/api/users';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/types/auth';

/**
 * Hook for fetching all users
 */
export function useUsers() {
  return useApi<User[]>(usersApi.getUsers, { immediate: true });
}

/**
 * Hook for fetching a single user by ID
 */
export function useUser(id: string) {
  return useApi<User>(
    () => usersApi.getUserById(id),
    { immediate: !!id }
  );
}

/**
 * Hook for creating a new user
 */
export function useCreateUser() {
  const { execute, loading, error } = useApi<User>(
    (data: CreateUserRequest) => usersApi.createUser(data)
  );

  const createUser = useCallback(
    async (data: CreateUserRequest) => {
      return execute(data);
    },
    [execute]
  );

  return { createUser, loading, error };
}

/**
 * Hook for updating an existing user
 */
export function useUpdateUser() {
  const { execute, loading, error } = useApi<User>(
    (id: string, data: UpdateUserRequest) => usersApi.updateUser(id, data)
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserRequest) => {
      return execute(id, data);
    },
    [execute]
  );

  return { updateUser, loading, error };
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
  const { execute, loading, error } = useApi<void>(
    (id: string) => usersApi.deleteUser(id)
  );

  const deleteUser = useCallback(
    async (id: string) => {
      return execute(id);
    },
    [execute]
  );

  return { deleteUser, loading, error };
}

/**
 * Hook for searching users
 */
export function useSearchUsers() {
  const { data, loading, error, execute } = useApi<User[]>(
    (query: string) => usersApi.searchUsers(query)
  );

  const searchUsers = useCallback(
    async (query: string) => {
      return execute(query);
    },
    [execute]
  );

  return { users: data, loading, error, searchUsers };
}
