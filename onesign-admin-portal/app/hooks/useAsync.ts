'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for handling async operations
 *
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   async (userId) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     return response.json();
 *   }
 * );
 *
 * <button onClick={() => execute(123)}>Load User</button>
 */
export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  // Keep track of mounted state to prevent state updates on unmounted component
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (mountedRef.current) {
          setState((prev) => ({ ...prev, loading: false, error }));
        }

        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setState({ data: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
  };
}
