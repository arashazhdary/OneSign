import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkOperations } from '@/hooks/useBulkOperations';

interface TestItem {
  id: number;
  name: string;
}

describe('useBulkOperations Hook', () => {
  const mockItems: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    expect(result.current.selectedItems.size).toBe(0);
    expect(result.current.selectAll).toBe(false);
  });

  it('should toggle item selection', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
    });

    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.getSelectedCount()).toBe(1);
  });

  it('should untoggle selected item', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
    });

    expect(result.current.isSelected(1)).toBe(true);

    act(() => {
      result.current.toggleItem(1);
    });

    expect(result.current.isSelected(1)).toBe(false);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should select all items', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectAll).toBe(true);
    expect(result.current.getSelectedCount()).toBe(3);
    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.isSelected(3)).toBe(true);
  });

  it('should deselect all items when toggling all again', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectAll).toBe(true);

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectAll).toBe(false);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(2);
    });

    expect(result.current.getSelectedCount()).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.getSelectedCount()).toBe(0);
    expect(result.current.selectAll).toBe(false);
  });

  it('should get selected items', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(3);
    });

    const selectedItems = result.current.getSelectedItems();

    expect(selectedItems).toHaveLength(2);
    expect(selectedItems).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 3, name: 'Item 3' },
    ]);
  });

  it('should get selected count', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(2);
      result.current.toggleItem(3);
    });

    expect(result.current.getSelectedCount()).toBe(3);
  });

  it('should perform bulk delete', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(2);
    });

    await act(async () => {
      await result.current.bulkDelete(onDelete);
    });

    expect(onDelete).toHaveBeenCalledWith([1, 2]);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should perform bulk update', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const updates = { name: 'Updated' };
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(3);
    });

    await act(async () => {
      await result.current.bulkUpdate(updates, onUpdate);
    });

    expect(onUpdate).toHaveBeenCalledWith([1, 3], updates);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => useBulkOperations([]));

    expect(result.current.getSelectedCount()).toBe(0);
    expect(result.current.getSelectedItems()).toEqual([]);
  });

  it('should work with string IDs', () => {
    const itemsWithStringIds = [
      { id: 'a', name: 'Item A' },
      { id: 'b', name: 'Item B' },
    ];

    const { result } = renderHook(() => useBulkOperations(itemsWithStringIds));

    act(() => {
      result.current.toggleItem('a');
    });

    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.getSelectedCount()).toBe(1);
  });

  it('should maintain selection across multiple operations', () => {
    const { result } = renderHook(() => useBulkOperations(mockItems));

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(2);
      result.current.toggleItem(1); // Toggle off
      result.current.toggleItem(3);
    });

    expect(result.current.getSelectedCount()).toBe(2);
    expect(result.current.isSelected(1)).toBe(false);
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.isSelected(3)).toBe(true);
  });
});
