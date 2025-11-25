import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call callback when correct key combination is pressed', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', ctrl: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when wrong key is pressed', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', ctrl: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle shift modifier correctly', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'z', ctrl: true, shift: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when shift modifier is missing', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'z', ctrl: true, shift: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: false,
    });

    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle alt modifier correctly', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'f', alt: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'f',
      altKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle Escape key without modifiers', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'Escape', callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple shortcuts', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', ctrl: true, callback: callback1 },
      { key: 'n', ctrl: true, callback: callback2 },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event1 = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    window.dispatchEvent(event1);

    const event2 = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    });
    window.dispatchEvent(event2);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should handle case-insensitive key matching', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'K', ctrl: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should clean up event listener on unmount', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', ctrl: true, callback },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    unmount();

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle meta key (Command on Mac)', () => {
    const callback = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', ctrl: true, callback },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Meta key (Cmd) should work as Ctrl
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
