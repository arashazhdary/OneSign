import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { usersApi } from '@/services/users.api';

vi.mock('@/services/users.api');

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

describe('Bulk Operations Integration Tests', () => {
  const mockUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should select multiple users and perform bulk delete', async () => {
    vi.mocked(usersApi.bulkDelete).mockResolvedValue();

    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    // Select multiple users
    act(() => {
      result.current.toggleItem('1');
      result.current.toggleItem('2');
    });

    expect(result.current.getSelectedCount()).toBe(2);

    // Perform bulk delete
    await act(async () => {
      await result.current.bulkDelete(async (ids) => {
        await usersApi.bulkDelete(ids);
      });
    });

    expect(usersApi.bulkDelete).toHaveBeenCalledWith(['1', '2']);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should select all users and perform bulk update', async () => {
    vi.mocked(usersApi.bulkUpdate).mockResolvedValue();

    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    // Select all users
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.getSelectedCount()).toBe(3);

    // Perform bulk update
    const updates = { role: 'Admin' };
    await act(async () => {
      await result.current.bulkUpdate(updates, async (ids, data) => {
        await usersApi.bulkUpdate(ids, data);
      });
    });

    expect(usersApi.bulkUpdate).toHaveBeenCalledWith(['1', '2', '3'], updates);
    expect(result.current.getSelectedCount()).toBe(0);
  });

  it('should handle bulk delete error gracefully', async () => {
    const error = new Error('Delete failed');
    vi.mocked(usersApi.bulkDelete).mockRejectedValue(error);

    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    act(() => {
      result.current.toggleItem('1');
    });

    await expect(
      act(async () => {
        await result.current.bulkDelete(async (ids) => {
          await usersApi.bulkDelete(ids);
        });
      })
    ).rejects.toThrow('Delete failed');

    // Selection should remain after error
    expect(result.current.getSelectedCount()).toBe(1);
  });

  it('should maintain selection state across operations', () => {
    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    // Select some items
    act(() => {
      result.current.toggleItem('1');
      result.current.toggleItem('2');
    });

    expect(result.current.getSelectedCount()).toBe(2);

    // Deselect one
    act(() => {
      result.current.toggleItem('1');
    });

    expect(result.current.getSelectedCount()).toBe(1);
    expect(result.current.isSelected('2')).toBe(true);
    expect(result.current.isSelected('1')).toBe(false);
  });

  it('should get selected items correctly', () => {
    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    act(() => {
      result.current.toggleItem('1');
      result.current.toggleItem('3');
    });

    const selectedItems = result.current.getSelectedItems();

    expect(selectedItems).toHaveLength(2);
    expect(selectedItems[0]).toEqual(mockUsers[0]);
    expect(selectedItems[1]).toEqual(mockUsers[2]);
  });

  it('should clear selection after successful bulk operation', async () => {
    vi.mocked(usersApi.bulkDelete).mockResolvedValue();

    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.getSelectedCount()).toBe(3);

    await act(async () => {
      await result.current.bulkDelete(async (ids) => {
        await usersApi.bulkDelete(ids);
      });
    });

    expect(result.current.getSelectedCount()).toBe(0);
    expect(result.current.selectAll).toBe(false);
  });

  it('should handle bulk operations with empty selection', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    await act(async () => {
      await result.current.bulkDelete(onDelete);
    });

    expect(onDelete).toHaveBeenCalledWith([]);
  });

  it('should perform multiple bulk operations sequentially', async () => {
    vi.mocked(usersApi.bulkUpdate).mockResolvedValue();
    vi.mocked(usersApi.bulkDelete).mockResolvedValue();

    const { result } = renderHook(() => useBulkOperations<User>(mockUsers));

    // First operation: bulk update
    act(() => {
      result.current.toggleItem('1');
      result.current.toggleItem('2');
    });

    await act(async () => {
      await result.current.bulkUpdate({ role: 'Admin' }, async (ids, data) => {
        await usersApi.bulkUpdate(ids, data);
      });
    });

    expect(usersApi.bulkUpdate).toHaveBeenCalled();
    expect(result.current.getSelectedCount()).toBe(0);

    // Second operation: bulk delete
    act(() => {
      result.current.toggleItem('3');
    });

    await act(async () => {
      await result.current.bulkDelete(async (ids) => {
        await usersApi.bulkDelete(ids);
      });
    });

    expect(usersApi.bulkDelete).toHaveBeenCalled();
    expect(result.current.getSelectedCount()).toBe(0);
  });
});
