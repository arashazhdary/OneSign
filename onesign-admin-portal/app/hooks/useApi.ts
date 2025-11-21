'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseApiOptions<T> {
  immediate?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

/**
 * Generic API hook with loading/error states
 *
 * @example
 * const { data, loading, error, execute } = useApi(fetchUsers);
 *
 * @example
 * const { data, loading, error } = useApi(fetchUsers, { immediate: true });
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    initialData = null,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: immediate,
    error: null,
  });

  const [lastArgs, setLastArgs] = useState<any[]>([]);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLastArgs(args);

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({ ...prev, loading: false, error }));
        onError?.(error);
        return null;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
    setLastArgs([]);
  }, [initialData]);

  const refetch = useCallback(async (): Promise<T | null> => {
    return execute(...lastArgs);
  }, [execute, lastArgs]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}
