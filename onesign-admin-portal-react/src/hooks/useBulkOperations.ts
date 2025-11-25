import { useState, useCallback } from 'react';

export interface BulkOperationsState<T> {
  selectedItems: Set<T>;
  selectAll: boolean;
}

export const useBulkOperations = <T extends { id: string | number }>(
  items: T[] = []
) => {
  const [selectedItems, setSelectedItems] = useState<Set<T['id']>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const toggleItem = useCallback((id: T['id']) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(items.map((item) => item.id));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  }, [selectAll, items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, []);

  const isSelected = useCallback(
    (id: T['id']) => selectedItems.has(id),
    [selectedItems]
  );

  const getSelectedCount = useCallback(
    () => selectedItems.size,
    [selectedItems]
  );

  const getSelectedItems = useCallback(
    () => items.filter((item) => selectedItems.has(item.id)),
    [items, selectedItems]
  );

  const bulkDelete = useCallback(
    async (onDelete: (ids: T['id'][]) => Promise<void>) => {
      const ids = Array.from(selectedItems);
      await onDelete(ids);
      clearSelection();
    },
    [selectedItems, clearSelection]
  );

  const bulkUpdate = useCallback(
    async (
      updates: Partial<T>,
      onUpdate: (ids: T['id'][], updates: Partial<T>) => Promise<void>
    ) => {
      const ids = Array.from(selectedItems);
      await onUpdate(ids, updates);
      clearSelection();
    },
    [selectedItems, clearSelection]
  );

  return {
    selectedItems,
    selectAll,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    getSelectedCount,
    getSelectedItems,
    bulkDelete,
    bulkUpdate,
  };
};
