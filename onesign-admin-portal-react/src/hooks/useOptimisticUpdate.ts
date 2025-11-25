import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticUpdate = <T, TData = any>(
  initialData: T,
  updateFn: (data: TData) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
) => {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (newData: TData) => {
      // Store the current state for rollback
      const previousData = data;

      try {
        // Optimistically update the UI
        setData(newData as unknown as T);
        setIsUpdating(true);
        setError(null);

        // Perform the actual update
        const result = await updateFn(newData);

        // Update with the server response
        setData(result);

        // Success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        // Show success message
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        return result;
      } catch (err) {
        // Rollback to previous state on error
        setData(previousData);
        const error = err instanceof Error ? err : new Error('Update failed');
        setError(error);

        // Error callback
        if (options.onError) {
          options.onError(error);
        }

        // Show error message
        if (options.errorMessage) {
          toast.error(options.errorMessage);
        } else {
          toast.error(error.message);
        }

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [data, updateFn, options]
  );

  return {
    data,
    isUpdating,
    error,
    update,
    setData,
  };
};

export default useOptimisticUpdate;
