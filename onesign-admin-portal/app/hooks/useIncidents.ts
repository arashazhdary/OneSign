'use client';

import { useCallback } from 'react';
import { useApi } from './useApi';
import * as incidentsApi from '@/lib/api/incidents';
import type {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest
} from '@/lib/api/types/incidents';

/**
 * Hook for fetching all incidents
 */
export function useIncidents() {
  return useApi<Incident[]>(incidentsApi.getIncidents, { immediate: true });
}

/**
 * Hook for fetching a single incident by ID
 */
export function useIncident(id: string) {
  return useApi<Incident>(
    () => incidentsApi.getIncidentById(id),
    { immediate: !!id }
  );
}

/**
 * Hook for creating a new incident
 */
export function useCreateIncident() {
  const { execute, loading, error } = useApi<Incident>(
    (data: CreateIncidentRequest) => incidentsApi.createIncident(data)
  );

  const createIncident = useCallback(
    async (data: CreateIncidentRequest) => {
      return execute(data);
    },
    [execute]
  );

  return { createIncident, loading, error };
}

/**
 * Hook for updating an existing incident
 */
export function useUpdateIncident() {
  const { execute, loading, error } = useApi<Incident>(
    (id: string, data: UpdateIncidentRequest) =>
      incidentsApi.updateIncident(id, data)
  );

  const updateIncident = useCallback(
    async (id: string, data: UpdateIncidentRequest) => {
      return execute(id, data);
    },
    [execute]
  );

  return { updateIncident, loading, error };
}

/**
 * Hook for deleting an incident
 */
export function useDeleteIncident() {
  const { execute, loading, error } = useApi<void>(
    (id: string) => incidentsApi.deleteIncident(id)
  );

  const deleteIncident = useCallback(
    async (id: string) => {
      return execute(id);
    },
    [execute]
  );

  return { deleteIncident, loading, error };
}

/**
 * Hook for assigning an incident
 */
export function useAssignIncident() {
  const { execute, loading, error } = useApi<Incident>(
    (id: string, assigneeId: string) =>
      incidentsApi.assignIncident(id, assigneeId)
  );

  const assignIncident = useCallback(
    async (id: string, assigneeId: string) => {
      return execute(id, assigneeId);
    },
    [execute]
  );

  return { assignIncident, loading, error };
}

/**
 * Hook for resolving an incident
 */
export function useResolveIncident() {
  const { execute, loading, error } = useApi<Incident>(
    (id: string, resolution: string) =>
      incidentsApi.resolveIncident(id, resolution)
  );

  const resolveIncident = useCallback(
    async (id: string, resolution: string) => {
      return execute(id, resolution);
    },
    [execute]
  );

  return { resolveIncident, loading, error };
}
