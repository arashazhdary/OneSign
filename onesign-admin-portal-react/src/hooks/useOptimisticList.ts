import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface OptimisticListOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticList = <T extends { id: string | number }>(
  initialList: T[]
) => {
  const [list, setList] = useState<T[]>(initialList);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const add = useCallback(
    async (
      item: T,
      addFn: (item: T) => Promise<T>,
      options: OptimisticListOptions = {}
    ) => {
      const previousList = list;

      try {
        // Optimistically add to the list
        setList((prev) => [...prev, item]);
        setIsUpdating(true);
        setError(null);

        // Perform the actual add
        const result = await addFn(item);

        // Update with the server response
        setList((prev) => [...prev.filter((i) => i.id !== item.id), result]);

        if (options.onSuccess) options.onSuccess();
        if (options.successMessage) toast.success(options.successMessage);

        return result;
      } catch (err) {
        // Rollback on error
        setList(previousList);
        const error = err instanceof Error ? err : new Error('Add failed');
        setError(error);

        if (options.onError) options.onError(error);
        if (options.errorMessage) toast.error(options.errorMessage);
        else toast.error(error.message);

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [list]
  );

  const update = useCallback(
    async (
      id: string | number,
      updates: Partial<T>,
      updateFn: (id: string | number, updates: Partial<T>) => Promise<T>,
      options: OptimisticListOptions = {}
    ) => {
      const previousList = list;

      try {
        // Optimistically update the item
        setList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
        setIsUpdating(true);
        setError(null);

        // Perform the actual update
        const result = await updateFn(id, updates);

        // Update with the server response
        setList((prev) => prev.map((item) => (item.id === id ? result : item)));

        if (options.onSuccess) options.onSuccess();
        if (options.successMessage) toast.success(options.successMessage);

        return result;
      } catch (err) {
        // Rollback on error
        setList(previousList);
        const error = err instanceof Error ? err : new Error('Update failed');
        setError(error);

        if (options.onError) options.onError(error);
        if (options.errorMessage) toast.error(options.errorMessage);
        else toast.error(error.message);

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [list]
  );

  const remove = useCallback(
    async (
      id: string | number,
      removeFn: (id: string | number) => Promise<void>,
      options: OptimisticListOptions = {}
    ) => {
      const previousList = list;

      try {
        // Optimistically remove from the list
        setList((prev) => prev.filter((item) => item.id !== id));
        setIsUpdating(true);
        setError(null);

        // Perform the actual remove
        await removeFn(id);

        if (options.onSuccess) options.onSuccess();
        if (options.successMessage) toast.success(options.successMessage);
      } catch (err) {
        // Rollback on error
        setList(previousList);
        const error = err instanceof Error ? err : new Error('Remove failed');
        setError(error);

        if (options.onError) options.onError(error);
        if (options.errorMessage) toast.error(options.errorMessage);
        else toast.error(error.message);

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [list]
  );

  const bulkRemove = useCallback(
    async (
      ids: (string | number)[],
      removeFn: (ids: (string | number)[]) => Promise<void>,
      options: OptimisticListOptions = {}
    ) => {
      const previousList = list;

      try {
        // Optimistically remove from the list
        setList((prev) => prev.filter((item) => !ids.includes(item.id)));
        setIsUpdating(true);
        setError(null);

        // Perform the actual remove
        await removeFn(ids);

        if (options.onSuccess) options.onSuccess();
        if (options.successMessage) toast.success(options.successMessage);
      } catch (err) {
        // Rollback on error
        setList(previousList);
        const error = err instanceof Error ? err : new Error('Bulk remove failed');
        setError(error);

        if (options.onError) options.onError(error);
        if (options.errorMessage) toast.error(options.errorMessage);
        else toast.error(error.message);

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [list]
  );

  return {
    list,
    setList,
    isUpdating,
    error,
    add,
    update,
    remove,
    bulkRemove,
  };
};

export default useOptimisticList;
