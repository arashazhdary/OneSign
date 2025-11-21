'use client';

import { useState, useEffect } from 'react';

export type KeyboardKey = string;

export interface UseKeyPressOptions {
  target?: HTMLElement | Document | Window;
  eventType?: 'keydown' | 'keyup';
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Hook for keyboard shortcuts
 *
 * @example
 * const enterPressed = useKeyPress('Enter');
 * const escapePressed = useKeyPress('Escape');
 *
 * @example
 * // Ctrl+S shortcut
 * const saveShortcut = useKeyPress('s', {
 *   ctrlKey: true
 * });
 *
 * useEffect(() => {
 *   if (saveShortcut) {
 *     handleSave();
 *   }
 * }, [saveShortcut]);
 */
export function useKeyPress(
  targetKey: KeyboardKey,
  options: UseKeyPressOptions = {}
): boolean {
  const {
    target = typeof window !== 'undefined' ? window : undefined,
    eventType = 'keydown',
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
  } = options;

  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    if (!target) {
      return;
    }

    const handleKeyEvent = (event: KeyboardEvent) => {
      const { key, ctrlKey: ctrl, shiftKey: shift, altKey: alt, metaKey: meta } = event;

      // Check if the pressed key matches
      const keyMatch = key.toLowerCase() === targetKey.toLowerCase();

      // Check if modifiers match
      const modifiersMatch =
        (!ctrlKey || ctrl) &&
        (!shiftKey || shift) &&
        (!altKey || alt) &&
        (!metaKey || meta);

      if (keyMatch && modifiersMatch) {
        if (eventType === 'keydown') {
          setKeyPressed(true);
        }
      } else if (eventType === 'keyup' && key.toLowerCase() === targetKey.toLowerCase()) {
        setKeyPressed(false);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === targetKey.toLowerCase()) {
        setKeyPressed(false);
      }
    };

    target.addEventListener(eventType, handleKeyEvent as EventListener);

    // Always listen for keyup to reset state
    if (eventType === 'keydown') {
      target.addEventListener('keyup', handleKeyUp as EventListener);
    }

    return () => {
      target.removeEventListener(eventType, handleKeyEvent as EventListener);
      if (eventType === 'keydown') {
        target.removeEventListener('keyup', handleKeyUp as EventListener);
      }
    };
  }, [targetKey, target, eventType, ctrlKey, shiftKey, altKey, metaKey]);

  return keyPressed;
}

/**
 * Hook for multiple keyboard shortcuts
 *
 * @example
 * const { keys } = useKeyPresses(['Ctrl+s', 'Ctrl+p']);
 *
 * useEffect(() => {
 *   if (keys['Ctrl+s']) {
 *     handleSave();
 *   }
 *   if (keys['Ctrl+p']) {
 *     handlePrint();
 *   }
 * }, [keys]);
 */
export function useKeyPresses(shortcuts: string[]): { keys: Record<string, boolean> } {
  const [keys, setKeys] = useState<Record<string, boolean>>(
    shortcuts.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = [
        event.ctrlKey && 'Ctrl',
        event.shiftKey && 'Shift',
        event.altKey && 'Alt',
        event.metaKey && 'Meta',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (shortcuts.some((shortcut) => shortcut.toLowerCase() === pressedKey.toLowerCase())) {
        setKeys((prev) => ({ ...prev, [pressedKey]: true }));
      }
    };

    const handleKeyUp = () => {
      setKeys(shortcuts.reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts]);

  return { keys };
}
