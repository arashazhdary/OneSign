'use client';

import { useCallback } from 'react';
import { useApi } from './useApi';
import { applicationsService } from '@/lib/api/services/applications.service';

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

// API functions using applicationsService
const applicationsApi = {
  getApplications: async (tenantId: string): Promise<Application[]> => {
    return (await applicationsService.getApplications(tenantId, {})) as Application[];
  },
  getApplicationById: async (id: string, tenantId: string): Promise<Application> => {
    return (await applicationsService.getApplicationById(id, tenantId)) as Application;
  },
  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    return (await applicationsService.createApplication(data.tenantId, data)) as Application;
  },
  updateApplication: async (id: string, tenantId: string, data: UpdateApplicationRequest): Promise<Application> => {
    return (await applicationsService.updateApplication(id, tenantId, data)) as Application;
  },
  deleteApplication: async (id: string, tenantId: string): Promise<void> => {
    await applicationsService.deleteApplication(id, tenantId);
  },
};

/**
 * Hook for fetching all applications
 */
export function useApplications(tenantId: string) {
  return useApi<Application[]>(
    () => applicationsApi.getApplications(tenantId),
    { immediate: !!tenantId }
  );
}

/**
 * Hook for fetching a single application by ID
 */
export function useApplication(id: string, tenantId: string) {
  return useApi<Application>(
    () => applicationsApi.getApplicationById(id, tenantId),
    { immediate: !!id && !!tenantId }
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
    (id: string, tenantId: string, data: UpdateApplicationRequest) =>
      applicationsApi.updateApplication(id, tenantId, data)
  );

  const updateApplication = useCallback(
    async (id: string, tenantId: string, data: UpdateApplicationRequest) => {
      return execute(id, tenantId, data);
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
    (id: string, tenantId: string) => applicationsApi.deleteApplication(id, tenantId)
  );

  const deleteApplication = useCallback(
    async (id: string, tenantId: string) => {
      return execute(id, tenantId);
    },
    [execute]
  );

  return { deleteApplication, loading, error };
}
