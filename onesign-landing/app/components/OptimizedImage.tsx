'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Optimized Image Component
 * Wrapper around next/image with loading states and error handling
 */

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  className = '',
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center p-4">
          <span className="text-4xl">🖼️</span>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Image failed to load
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse"
          style={fill ? undefined : { width, height }}
        >
          <span className="text-2xl">⏳</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
      />
    </div>
  );
}

/**
 * Responsive Image Component
 * Automatically handles responsive sizing
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2' | '2/1';
  priority?: boolean;
  quality?: number;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = '16/9',
  priority = false,
  quality = 85,
  className = '',
}: ResponsiveImageProps) {
  const aspectRatioMap = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '2/1': 'aspect-[2/1]',
  };

  return (
    <div className={`relative ${aspectRatioMap[aspectRatio]} ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}

/**
 * Avatar Image Component
 * Optimized for profile pictures
 */
export interface AvatarImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className = '',
}: AvatarImageProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const pixelSizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  return (
    <div
      className={`relative ${sizeMap[size]} rounded-full overflow-hidden ${className}`}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={pixelSizeMap[size]}
        height={pixelSizeMap[size]}
        quality={90}
        className="object-cover"
      />
    </div>
  );
}

/**
 * Logo Image Component
 * Optimized for brand logos
 */
export interface LogoImageProps {
  src: string;
  alt: string;
  height?: number;
  className?: string;
}

export function LogoImage({
  src,
  alt,
  height = 40,
  className = '',
}: LogoImageProps) {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Image
        src={src}
        alt={alt}
        width={0}
        height={height}
        style={{ width: 'auto', height: '100%' }}
        quality={100}
        priority
      />
    </div>
  );
}
