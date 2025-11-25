import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

describe('useSessionManagement Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize session management', () => {
    const { result } = renderHook(() => useSessionManagement());

    expect(result.current).toHaveProperty('extendSession');
    expect(result.current).toHaveProperty('resetTimer');
  });

  it('should set initial timers', () => {
    renderHook(() => useSessionManagement({
      timeout: 30,
      warningTime: 5,
    }));

    expect(localStorage.getItem('sessionWarningTimer')).toBeTruthy();
    expect(localStorage.getItem('sessionTimeoutTimer')).toBeTruthy();
    expect(localStorage.getItem('lastActivity')).toBeTruthy();
  });

  it('should show warning before timeout', async () => {
    renderHook(() => useSessionManagement({
      timeout: 10, // 10 minutes
      warningTime: 2, // warn 2 minutes before
    }));

    // Fast forward to warning time (8 minutes)
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('session will expire'),
        expect.any(Object)
      );
    });
  });

  it('should logout on session timeout', async () => {
    const mockLogout = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      logout: mockLogout,
    } as any);

    renderHook(() => useSessionManagement({
      timeout: 1, // 1 minute
      warningTime: 0.5,
    }));

    // Fast forward to timeout
    act(() => {
      vi.advanceTimersByTime(1 * 60 * 1000);
    });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('session has expired')
      );
    });
  });

  it('should call custom onWarning callback', async () => {
    const onWarning = vi.fn();

    renderHook(() => useSessionManagement({
      timeout: 10,
      warningTime: 2,
      onWarning,
    }));

    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });

    await waitFor(() => {
      expect(onWarning).toHaveBeenCalled();
    });
  });

  it('should call custom onTimeout callback', async () => {
    const onTimeout = vi.fn();

    renderHook(() => useSessionManagement({
      timeout: 1,
      onTimeout,
    }));

    act(() => {
      vi.advanceTimersByTime(1 * 60 * 1000);
    });

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalled();
    });
  });

  it('should extend session and show success message', () => {
    const { result } = renderHook(() => useSessionManagement());

    act(() => {
      result.current.extendSession();
    });

    expect(toast.success).toHaveBeenCalledWith('Session extended');
  });

  it('should reset timer on user activity', () => {
    renderHook(() => useSessionManagement());

    const initialTimer = localStorage.getItem('sessionTimeoutTimer');

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event('mousedown'));
    });

    const newTimer = localStorage.getItem('sessionTimeoutTimer');

    expect(newTimer).not.toBe(initialTimer);
  });

  it('should reset timer on different activity events', () => {
    renderHook(() => useSessionManagement());

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((eventType) => {
      const initialTimer = localStorage.getItem('sessionTimeoutTimer');

      act(() => {
        window.dispatchEvent(new Event(eventType));
      });

      const newTimer = localStorage.getItem('sessionTimeoutTimer');

      expect(newTimer).not.toBe(initialTimer);
    });
  });

  it('should cleanup timers on unmount', () => {
    const { unmount } = renderHook(() => useSessionManagement());

    unmount();

    expect(localStorage.getItem('sessionWarningTimer')).toBeNull();
    expect(localStorage.getItem('sessionTimeoutTimer')).toBeNull();
  });

  it('should clear existing timers when resetting', () => {
    const { result } = renderHook(() => useSessionManagement());

    const initialWarning = localStorage.getItem('sessionWarningTimer');
    const initialTimeout = localStorage.getItem('sessionTimeoutTimer');

    act(() => {
      result.current.resetTimer();
    });

    const newWarning = localStorage.getItem('sessionWarningTimer');
    const newTimeout = localStorage.getItem('sessionTimeoutTimer');

    expect(newWarning).not.toBe(initialWarning);
    expect(newTimeout).not.toBe(initialTimeout);
  });
});
