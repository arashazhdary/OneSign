'use client';

import { useEffect, RefObject } from 'react';

/**
 * Hook for detecting clicks outside an element
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => {
 *   setIsOpen(false);
 * });
 *
 * return <div ref={ref}>Click outside me!</div>;
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
