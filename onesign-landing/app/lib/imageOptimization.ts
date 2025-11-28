/**
 * Image Optimization Utilities
 * Helper functions for image processing and optimization
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Calculate responsive image sizes string
 */
export function getResponsiveSizes(breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
  } = breakpoints || {};

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(
  width: number,
  height: number
): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Get optimized image dimensions
 */
export function getOptimizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): ImageDimensions {
  let width = originalWidth;
  let height = originalHeight;

  if (maxWidth && width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = (maxHeight / height) * width;
    height = maxHeight;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return widths
    .map((width) => {
      // In production, this would generate actual optimized URLs
      // using your image CDN or optimization service
      return `${src}?w=${width} ${width}w`;
    })
    .join(', ');
}

/**
 * Image loader for Next.js Image component
 */
export function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Custom image loader for CDN or image optimization service
  // Example: Cloudinary, Imgix, Cloudflare Images, etc.

  const params = new URLSearchParams();
  params.set('w', width.toString());
  if (quality) {
    params.set('q', quality.toString());
  }

  // For local images, Next.js will handle optimization
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  // For external images, pass through or use CDN
  return src;
}

/**
 * Blur data URL generator for placeholder
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 8
): string {
  // Generate a simple gray blur placeholder
  const canvas =
    typeof document !== 'undefined'
      ? document.createElement('canvas')
      : null;

  if (!canvas) {
    // Fallback for SSR
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e5e7eb'; // gray-200
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Check if image format is supported
 */
export function isFormatSupported(format: string): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  return canvas.toDataURL(`image/${format}`).startsWith(`data:image/${format}`);
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority?: boolean): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = priority ? 'preload' : 'prefetch';
  link.as = 'image';
  link.href = src;

  document.head.appendChild(link);
}

/**
 * Batch preload images
 */
export function preloadImages(images: string[]): void {
  images.forEach((src) => preloadImage(src));
}

/**
 * Lazy load background image
 */
export function lazyLoadBackgroundImage(element: HTMLElement): void {
  if (!element) return;

  const imageUrl = element.dataset.bgImage;
  if (!imageUrl) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.style.backgroundImage = `url(${imageUrl})`;
          observer.unobserve(element);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(element);
}

/**
 * Image compression quality by device
 */
export function getQualityByDevice(): number {
  if (typeof window === 'undefined') return 85;

  // Lower quality for slow connections
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 60;
    }
    if (connection.effectiveType === '3g') {
      return 75;
    }
  }

  return 85;
}

/**
 * Progressive image loading
 */
export interface ProgressiveImageConfig {
  lowQualitySrc: string;
  highQualitySrc: string;
  placeholder?: string;
}

export function createProgressiveImageLoader(
  config: ProgressiveImageConfig
): {
  currentSrc: string;
  isHighQuality: boolean;
  load: () => Promise<void>;
} {
  let currentSrc = config.placeholder || config.lowQualitySrc;
  let isHighQuality = false;

  const load = async () => {
    // Load low quality first
    await loadImage(config.lowQualitySrc);
    currentSrc = config.lowQualitySrc;

    // Then load high quality
    await loadImage(config.highQualitySrc);
    currentSrc = config.highQualitySrc;
    isHighQuality = true;
  };

  return { currentSrc, isHighQuality, load };
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}
