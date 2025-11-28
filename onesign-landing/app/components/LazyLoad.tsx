'use client';

import { useState, useEffect, useRef, lazy, Suspense, ComponentType } from 'react';
import { Spinner } from './Loading';

/**
 * Lazy Loading Utilities
 * Components for lazy loading content and code splitting
 */

/**
 * Intersection Observer based lazy loading
 */
export interface LazyLoadProps {
  children: React.ReactNode;
  height?: number | string;
  offset?: number;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
}

export function LazyLoad({
  children,
  height = 'auto',
  offset = 100,
  placeholder,
  onLoad,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onLoad?.();
          observer.disconnect();
        }
      },
      {
        rootMargin: `${offset}px`,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [offset, onLoad]);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {isVisible ? children : placeholder || <div style={{ height }} />}
    </div>
  );
}

/**
 * Lazy load component with dynamic import
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <ComponentLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Component Loader
 */
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size="md" />
    </div>
  );
}

/**
 * Lazy load images
 */
export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  aspectRatio,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const style: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    aspectRatio: aspectRatio,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Lazy load sections
 */
export interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
  fallback?: React.ReactNode;
}

export function LazySection({
  children,
  className = '',
  minHeight = 400,
  fallback,
}: LazySectionProps) {
  return (
    <LazyLoad
      height={minHeight}
      offset={200}
      placeholder={
        fallback || (
          <div
            className={`flex items-center justify-center ${className}`}
            style={{ minHeight }}
          >
            <Spinner size="lg" />
          </div>
        )
      }
    >
      {children}
    </LazyLoad>
  );
}

/**
 * Lazy load iframe
 */
export interface LazyIframeProps {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function LazyIframe({
  src,
  title,
  width = '100%',
  height = 400,
  className = '',
}: LazyIframeProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          loading="lazy"
          className="border-0"
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-full">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}

/**
 * Code splitting with loading states
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  LoadingComponent?: ComponentType
): ComponentType<P> {
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <ComponentLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc();
}

/**
 * Hook for lazy loading data
 */
export function useLazyLoad<T>(
  fetchData: () => Promise<T>,
  options?: {
    offset?: number;
    immediate?: boolean;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  ref: React.RefObject<HTMLDivElement | null>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (options?.immediate) {
      loadData();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoadedRef.current) {
          loadData();
          observer.disconnect();
        }
      },
      { rootMargin: `${options?.offset || 100}px` }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const loadData = async () => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, ref };
}
