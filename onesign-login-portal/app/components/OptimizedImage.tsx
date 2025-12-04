'use client';

import { useState, useEffect, useRef } from 'react';
import {
  generateOptimizedImageSet,
  preloadResponsiveImage,
  supportsWebP,
  type ImageOptimizationConfig,
} from '@/lib/image-optimization';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  config?: ImageOptimizationConfig;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

/**
 * OptimizedImage component with responsive images, lazy loading, and WebP support
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  config,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  objectFit = 'cover',
  objectPosition = 'center',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(priority || loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate optimized image set
  const imageSet = generateOptimizedImageSet(src, config);
  const webPSupported = typeof window !== 'undefined' && supportsWebP();

  // Handle lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || loading === 'eager' || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowImage(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority, loading]);

  // Preload if priority
  useEffect(() => {
    if (priority && !isLoaded) {
      preloadResponsiveImage(imageSet.src, imageSet.srcSet, imageSet.srcSetWebP);
    }
  }, [priority, imageSet, isLoaded]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && imageSet.blurDataURL && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${imageSet.blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: objectPosition,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: showImage ? 1 : 0,
          }}
        />
      )}

      {/* Main image with WebP support */}
      {showImage && !hasError && (
        <picture>
          {/* WebP source */}
          {webPSupported && imageSet.srcSetWebP && (
            <source type="image/webp" srcSet={imageSet.srcSetWebP} sizes={imageSet.sizes} />
          )}

          {/* Fallback source */}
          <source srcSet={imageSet.srcSet} sizes={imageSet.sizes} />

          {/* Image element */}
          <img
            ref={imgRef}
            src={imageSet.src}
            srcSet={imageSet.srcSet}
            sizes={imageSet.sizes}
            alt={alt}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              objectFit,
              objectPosition,
            }}
            draggable={false}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Loading placeholder (shown before intersection) */}
      {!showImage && !hasError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}
    </div>
  );
}
