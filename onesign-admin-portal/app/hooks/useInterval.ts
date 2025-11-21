'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook for setInterval with automatic cleanup
 *
 * @example
 * const [count, setCount] = useState(0);
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if no delay is specified
    if (delay === null) {
      return;
    }

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
