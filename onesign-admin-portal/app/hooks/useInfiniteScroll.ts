'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
}

/**
 * Hook for infinite scroll functionality
 *
 * @example
 * const { ref, isIntersecting } = useInfiniteScroll({
 *   threshold: 0.5,
 *   enabled: hasMore && !loading
 * });
 *
 * useEffect(() => {
 *   if (isIntersecting) {
 *     loadMore();
 *   }
 * }, [isIntersecting]);
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref}>Loading...</div>
 *   </div>
 * );
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 1.0,
    rootMargin = '0px',
    enabled = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setIsIntersecting(false);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, enabled]);

  return {
    ref,
    isIntersecting,
  };
}

/**
 * Hook for infinite scroll with automatic loading
 *
 * @example
 * const { data, loading, hasMore, containerRef } = useInfiniteScrollData({
 *   fetchData: async (page) => {
 *     const response = await fetch(`/api/items?page=${page}`);
 *     return response.json();
 *   },
 *   pageSize: 20
 * });
 */
export interface UseInfiniteScrollDataOptions<T> {
  fetchData: (page: number) => Promise<T[]>;
  pageSize?: number;
  initialPage?: number;
}

export interface UseInfiniteScrollDataReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScrollData<T>({
  fetchData,
  pageSize = 20,
  initialPage = 1,
}: UseInfiniteScrollDataOptions<T>): UseInfiniteScrollDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetchData(page);

      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  const { ref: containerRef, isIntersecting } = useInfiniteScroll({
    enabled: hasMore && !loading,
  });

  useEffect(() => {
    if (isIntersecting) {
      loadMore();
    }
  }, [isIntersecting]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    containerRef,
  };
}
