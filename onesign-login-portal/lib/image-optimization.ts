/**
 * Image Optimization Utility
 *
 * Provides utilities for optimizing images with:
 * - Responsive image generation (srcset)
 * - WebP format with fallback
 * - Blur placeholder generation
 * - CDN URL construction
 * - Image preloading
 */

export interface ImageSource {
  url: string;
  width: number;
  format?: 'webp' | 'jpeg' | 'png' | 'original';
}

export interface OptimizedImageSet {
  src: string;
  srcSet: string;
  srcSetWebP?: string;
  sizes: string;
  blurDataURL?: string;
  width: number;
  height: number;
}

export interface ImageOptimizationConfig {
  cdnBaseUrl?: string;
  defaultQuality?: number;
  responsiveWidths?: number[];
  enableWebP?: boolean;
  enableBlurPlaceholder?: boolean;
}

// Default responsive breakpoints for images
const DEFAULT_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// Default image quality
const DEFAULT_QUALITY = 80;

/**
 * Constructs a CDN URL for an image with optimization parameters
 */
export function buildCDNUrl(
  imageUrl: string,
  options: {
    cdnBaseUrl?: string;
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  } = {}
): string {
  const { cdnBaseUrl, width, quality = DEFAULT_QUALITY, format } = options;

  // If no CDN is configured, return original URL with query params
  if (!cdnBaseUrl) {
    const url = new URL(imageUrl);
    if (width) url.searchParams.set('w', width.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (format && format !== 'auto') url.searchParams.set('fm', format);
    return url.toString();
  }

  // Construct CDN URL (supports common CDN patterns)
  // Format: {cdnBaseUrl}/{transformations}/{originalUrl}
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format && format !== 'auto') transformations.push(`f_${format}`);

  const transformStr = transformations.length > 0 ? transformations.join(',') : '';

  // Remove protocol from original URL for CDN path
  const imagePath = imageUrl.replace(/^https?:\/\//, '');

  return transformStr
    ? `${cdnBaseUrl}/${transformStr}/${imagePath}`
    : `${cdnBaseUrl}/${imagePath}`;
}

/**
 * Generates a responsive srcset string for an image
 */
export function generateSrcSet(
  imageUrl: string,
  widths: number[],
  config: ImageOptimizationConfig = {}
): string {
  const { cdnBaseUrl, defaultQuality = DEFAULT_QUALITY } = config;

  return widths
    .map((width) => {
      const url = buildCDNUrl(imageUrl, {
        cdnBaseUrl,
        width,
        quality: defaultQuality,
        format: 'auto',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generates a WebP srcset string for an image
 */
export function generateWebPSrcSet(
  imageUrl: string,
  widths: number[],
  config: ImageOptimizationConfig = {}
): string {
  const { cdnBaseUrl, defaultQuality = DEFAULT_QUALITY } = config;

  return widths
    .map((width) => {
      const url = buildCDNUrl(imageUrl, {
        cdnBaseUrl,
        width,
        quality: defaultQuality,
        format: 'webp',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generates a blur placeholder data URL for an image
 * This creates a tiny base64-encoded version for blur-up effect
 */
export function generateBlurPlaceholder(imageUrl: string): string {
  // For production, this would ideally be generated on the server
  // or during build time. For now, we'll use a simple gray gradient
  // In a real implementation, you'd want to:
  // 1. Fetch a tiny version of the image (e.g., 10x10px)
  // 2. Convert it to base64
  // 3. Return that as the blur placeholder

  // Simplified placeholder - a subtle gray gradient
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad)" />
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generates an optimized image set with all variants
 */
export function generateOptimizedImageSet(
  imageUrl: string,
  config: ImageOptimizationConfig = {}
): OptimizedImageSet {
  const {
    cdnBaseUrl,
    defaultQuality = DEFAULT_QUALITY,
    responsiveWidths = DEFAULT_WIDTHS,
    enableWebP = true,
    enableBlurPlaceholder = true,
  } = config;

  // Generate primary source
  const src = buildCDNUrl(imageUrl, {
    cdnBaseUrl,
    width: 1920,
    quality: defaultQuality,
    format: 'auto',
  });

  // Generate srcset for standard formats
  const srcSet = generateSrcSet(imageUrl, responsiveWidths, config);

  // Generate WebP srcset if enabled
  const srcSetWebP = enableWebP
    ? generateWebPSrcSet(imageUrl, responsiveWidths, config)
    : undefined;

  // Generate blur placeholder if enabled
  const blurDataURL = enableBlurPlaceholder
    ? generateBlurPlaceholder(imageUrl)
    : undefined;

  // Default sizes attribute (can be customized per use case)
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1920px';

  return {
    src,
    srcSet,
    srcSetWebP,
    sizes,
    blurDataURL,
    width: 1920,
    height: 1080, // 16:9 aspect ratio by default
  };
}

/**
 * Preloads an image in the browser
 */
export function preloadImage(imageUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Preloads an image with srcset support
 */
export function preloadResponsiveImage(
  src: string,
  srcSet?: string,
  srcSetWebP?: string
): void {
  // Preload WebP if supported and available
  if (srcSetWebP && supportsWebP()) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.imageSrcset = srcSetWebP;
    link.type = 'image/webp';
    document.head.appendChild(link);
  } else if (srcSet) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.imageSrcset = srcSet;
    document.head.appendChild(link);
  } else {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
}

/**
 * Checks if the browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if already cached
  const cached = sessionStorage.getItem('webp-support');
  if (cached !== null) return cached === 'true';

  // Create a small WebP image to test support
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    const support = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    sessionStorage.setItem('webp-support', support.toString());
    return support;
  }

  return false;
}

/**
 * Extracts the file extension from a URL
 */
export function getImageFormat(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpeg';
}

/**
 * Checks if an image URL is from an external domain
 */
export function isExternalImage(url: string): boolean {
  try {
    const imageUrl = new URL(url);
    const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    return currentUrl ? imageUrl.hostname !== currentUrl.hostname : true;
  } catch {
    return false; // Relative URLs are not external
  }
}

/**
 * Creates a responsive sizes attribute based on breakpoints
 */
export function generateSizesAttribute(
  breakpoints: { maxWidth: string; size: string }[]
): string {
  return breakpoints
    .map(({ maxWidth, size }) => `(max-width: ${maxWidth}) ${size}`)
    .join(', ');
}

/**
 * Lazy load images using Intersection Observer
 */
export function setupLazyLoading(
  element: HTMLElement,
  callback: () => void,
  options: IntersectionObserverInit = {}
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately if IntersectionObserver is not supported
    callback();
    return () => {};
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // Start loading 50px before entering viewport
    threshold: 0.01,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, defaultOptions);

  observer.observe(element);

  // Return cleanup function
  return () => observer.disconnect();
}
