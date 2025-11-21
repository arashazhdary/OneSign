'use client';

import { useCallback } from 'react';
import { useApi } from './useApi';

export interface Application {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  owner: string;
  tenantId: string;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  tenantId: string;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

// Mock API functions (replace with real API calls)
const applicationsApi = {
  getApplications: async (): Promise<Application[]> => {
    // TODO: Replace with real API call
    return [];
  },
  getApplicationById: async (id: string): Promise<Application> => {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  },
  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  },
  updateApplication: async (id: string, data: UpdateApplicationRequest): Promise<Application> => {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  },
  deleteApplication: async (id: string): Promise<void> => {
    // TODO: Replace with real API call
  },
};

/**
 * Hook for fetching all applications
 */
export function useApplications() {
  return useApi<Application[]>(applicationsApi.getApplications, { immediate: true });
}

/**
 * Hook for fetching a single application by ID
 */
export function useApplication(id: string) {
  return useApi<Application>(
    () => applicationsApi.getApplicationById(id),
    { immediate: !!id }
  );
}

/**
 * Hook for creating a new application
 */
export function useCreateApplication() {
  const { execute, loading, error } = useApi<Application>(
    (data: CreateApplicationRequest) => applicationsApi.createApplication(data)
  );

  const createApplication = useCallback(
    async (data: CreateApplicationRequest) => {
      return execute(data);
    },
    [execute]
  );

  return { createApplication, loading, error };
}

/**
 * Hook for updating an existing application
 */
export function useUpdateApplication() {
  const { execute, loading, error } = useApi<Application>(
    (id: string, data: UpdateApplicationRequest) =>
      applicationsApi.updateApplication(id, data)
  );

  const updateApplication = useCallback(
    async (id: string, data: UpdateApplicationRequest) => {
      return execute(id, data);
    },
    [execute]
  );

  return { updateApplication, loading, error };
}

/**
 * Hook for deleting an application
 */
export function useDeleteApplication() {
  const { execute, loading, error } = useApi<void>(
    (id: string) => applicationsApi.deleteApplication(id)
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      return execute(id);
    },
    [execute]
  );

  return { deleteApplication, loading, error };
}
