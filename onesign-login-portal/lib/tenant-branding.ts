// Helper to fetch and cache tenant branding with localStorage support
import { SliderImage, DEFAULT_SLIDER_IMAGES } from '@/app/components/ImageSlider';

export interface LoginPageConfig {
  backgroundType: 'color' | 'gradient' | 'image' | 'slider';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImageUrl?: string;
  showLogo: boolean;
  title?: string;
  subtitle?: string;
  sliderImages?: SliderImage[];
  sliderAutoPlay?: boolean;
  sliderInterval?: number;
  layout?: 'split' | 'centered' | 'overlay';
  formPosition?: 'left' | 'right';
}

export interface CDNConfig {
  baseUrl?: string;
  enabled?: boolean;
  quality?: number;
  enableWebP?: boolean;
  enableBlurPlaceholder?: boolean;
  responsiveWidths?: number[];
}

export interface TenantBranding {
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tenantName?: string;
  loginPageConfig?: LoginPageConfig;
  cdnConfig?: CDNConfig;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  footerText?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  features?: {
    showSocialLogin?: boolean;
    showRememberMe?: boolean;
    showLanguageSwitcher?: boolean;
    allowRegistration?: boolean;
    enableRecaptcha?: boolean;
    recaptchaSiteKey?: string;
  };
}

// Cache structure for localStorage
interface BrandingCacheEntry {
  version: string;
  tenantId: string;
  branding: TenantBranding;
  timestamp: number;
  etag?: string;
}

// Cache configuration
const CACHE_VERSION = '1.0';
const CACHE_KEY_PREFIX = 'tenant_branding_';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * API Cache-Control headers recommendation:
 *
 * Response Headers for /api/tenant/branding:
 * - Cache-Control: public, max-age=3600, stale-while-revalidate=86400
 * - ETag: <hash-of-branding-content>
 * - Last-Modified: <timestamp>
 *
 * This allows:
 * - Browser to cache for 1 hour
 * - Serve stale content while revalidating for 24 hours
 * - Support conditional requests with If-None-Match
 */

// Default branding configuration
export const DEFAULT_BRANDING: TenantBranding = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#10b981',
  tenantName: 'OneSign',
  welcomeTitle: 'Welcome Back',
  welcomeSubtitle: 'Sign in to continue to your account',
  loginPageConfig: {
    backgroundType: 'slider',
    showLogo: true,
    layout: 'split',
    formPosition: 'right',
    sliderAutoPlay: true,
    sliderInterval: 5000,
    sliderImages: DEFAULT_SLIDER_IMAGES,
    gradientStart: '#6366f1',
    gradientEnd: '#8b5cf6',
  },
  cdnConfig: {
    enabled: true,
    quality: 80,
    enableWebP: true,
    enableBlurPlaceholder: true,
    responsiveWidths: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  features: {
    showSocialLogin: true,
    showRememberMe: true,
    showLanguageSwitcher: true,
    allowRegistration: true,
    enableRecaptcha: false,
    recaptchaSiteKey: undefined,
  },
};

// In-memory cache for quick access (backward compatibility)
let cachedBranding: TenantBranding | null = null;
let cachedTenantId: string | null = null;

/**
 * Check if the cache entry is expired
 */
function isCacheExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_EXPIRATION_MS;
}

/**
 * Get cache key for a tenant
 */
function getCacheKey(tenantId: string): string {
  return `${CACHE_KEY_PREFIX}${tenantId}`;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get branding from localStorage
 */
function getFromLocalStorage(tenantId: string): BrandingCacheEntry | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const cacheKey = getCacheKey(tenantId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: BrandingCacheEntry = JSON.parse(cached);

    // Validate cache version
    if (entry.version !== CACHE_VERSION) {
      console.log('Cache version mismatch, invalidating cache');
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Validate tenant ID
    if (entry.tenantId !== tenantId) {
      console.warn('Cache tenant ID mismatch');
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Save branding to localStorage
 */
function saveToLocalStorage(
  tenantId: string,
  branding: TenantBranding,
  etag?: string
): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const cacheKey = getCacheKey(tenantId);
    const entry: BrandingCacheEntry = {
      version: CACHE_VERSION,
      tenantId,
      branding,
      timestamp: Date.now(),
      etag,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    console.error('Error saving to localStorage:', error);

    // Try to clear old cache entries
    try {
      clearOldCacheEntries();
      // Retry once
      const cacheKey = getCacheKey(tenantId);
      const entry: BrandingCacheEntry = {
        version: CACHE_VERSION,
        tenantId,
        branding,
        timestamp: Date.now(),
        etag,
      };
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (retryError) {
      console.error('Failed to save cache after cleanup:', retryError);
    }
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCacheEntries(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const now = Date.now();
    const keysToCheck: string[] = [];

    // Collect all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToCheck.push(key);
      }
    }

    // Check and remove old entries
    for (const key of keysToCheck) {
      try {
        const entry: BrandingCacheEntry = JSON.parse(localStorage.getItem(key) || '');

        // Remove if expired or version mismatch
        if (
          entry.version !== CACHE_VERSION ||
          now - entry.timestamp > CACHE_EXPIRATION_MS * 24 // Keep for max 24 hours
        ) {
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid entry, remove it
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
  }
}

/**
 * Merge fetched branding with defaults
 */
function mergeBrandingWithDefaults(data: Partial<TenantBranding>): TenantBranding {
  return {
    ...DEFAULT_BRANDING,
    ...data,
    loginPageConfig: {
      backgroundType: data.loginPageConfig?.backgroundType ?? DEFAULT_BRANDING.loginPageConfig!.backgroundType,
      showLogo: data.loginPageConfig?.showLogo ?? DEFAULT_BRANDING.loginPageConfig!.showLogo,
      backgroundColor: data.loginPageConfig?.backgroundColor ?? DEFAULT_BRANDING.loginPageConfig!.backgroundColor,
      gradientStart: data.loginPageConfig?.gradientStart ?? DEFAULT_BRANDING.loginPageConfig!.gradientStart,
      gradientEnd: data.loginPageConfig?.gradientEnd ?? DEFAULT_BRANDING.loginPageConfig!.gradientEnd,
      backgroundImageUrl: data.loginPageConfig?.backgroundImageUrl ?? DEFAULT_BRANDING.loginPageConfig!.backgroundImageUrl,
      title: data.loginPageConfig?.title ?? DEFAULT_BRANDING.loginPageConfig!.title,
      subtitle: data.loginPageConfig?.subtitle ?? DEFAULT_BRANDING.loginPageConfig!.subtitle,
      sliderImages: data.loginPageConfig?.sliderImages?.length
        ? data.loginPageConfig.sliderImages
        : DEFAULT_SLIDER_IMAGES,
      sliderAutoPlay: data.loginPageConfig?.sliderAutoPlay ?? DEFAULT_BRANDING.loginPageConfig!.sliderAutoPlay,
      sliderInterval: data.loginPageConfig?.sliderInterval ?? DEFAULT_BRANDING.loginPageConfig!.sliderInterval,
      layout: data.loginPageConfig?.layout ?? DEFAULT_BRANDING.loginPageConfig!.layout,
      formPosition: data.loginPageConfig?.formPosition ?? DEFAULT_BRANDING.loginPageConfig!.formPosition,
    },
    cdnConfig: {
      ...DEFAULT_BRANDING.cdnConfig,
      ...data.cdnConfig,
    },
    features: {
      ...DEFAULT_BRANDING.features,
      ...data.features,
    },
  };
}

/**
 * Fetch branding from API with ETag support
 */
async function fetchBrandingFromAPI(
  tenantId: string,
  etag?: string
): Promise<{ branding: TenantBranding; etag?: string; notModified: boolean }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
  const headers: HeadersInit = {};

  // Add If-None-Match header for conditional request
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await fetch(
    `${baseUrl}/api/tenant/branding?tenantId=${tenantId}`,
    { headers }
  );

  // Handle 304 Not Modified
  if (response.status === 304) {
    return { branding: DEFAULT_BRANDING, notModified: true };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch branding: ${response.status}`);
  }

  const data = await response.json();
  const newEtag = response.headers.get('ETag') || undefined;
  const mergedBranding = mergeBrandingWithDefaults(data);

  return { branding: mergedBranding, etag: newEtag, notModified: false };
}

/**
 * Get tenant branding with localStorage caching
 *
 * Implements stale-while-revalidate pattern:
 * 1. Return cached data immediately if available
 * 2. Fetch fresh data in background
 * 3. Update cache when fresh data arrives
 *
 * @param tenantId - The tenant ID to fetch branding for
 * @returns Promise<TenantBranding> - The tenant branding configuration
 */
export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  // Check in-memory cache first (fastest)
  if (cachedBranding && cachedTenantId === tenantId) {
    // Still fetch in background if cache might be stale
    const cacheEntry = getFromLocalStorage(tenantId);
    if (cacheEntry && isCacheExpired(cacheEntry.timestamp)) {
      // Trigger background refresh (fire and forget)
      fetchBrandingFromAPI(tenantId, cacheEntry.etag)
        .then(({ branding, etag, notModified }) => {
          if (!notModified) {
            cachedBranding = branding;
            cachedTenantId = tenantId;
            saveToLocalStorage(tenantId, branding, etag);
          } else {
            // Update timestamp even if not modified
            saveToLocalStorage(tenantId, cacheEntry.branding, etag);
          }
        })
        .catch((error) => {
          console.error('Background refresh failed:', error);
        });
    }
    return cachedBranding;
  }

  // Clear old tenant data when switching tenants
  if (cachedTenantId && cachedTenantId !== tenantId) {
    cachedBranding = null;
    cachedTenantId = null;
  }

  // Check localStorage cache
  const cacheEntry = getFromLocalStorage(tenantId);

  if (cacheEntry) {
    // Update in-memory cache
    cachedBranding = cacheEntry.branding;
    cachedTenantId = tenantId;

    // If cache is fresh, return immediately
    if (!isCacheExpired(cacheEntry.timestamp)) {
      return cacheEntry.branding;
    }

    // Cache is stale, return it but fetch fresh data in background
    fetchBrandingFromAPI(tenantId, cacheEntry.etag)
      .then(({ branding, etag, notModified }) => {
        if (!notModified) {
          cachedBranding = branding;
          saveToLocalStorage(tenantId, branding, etag);
        } else {
          // Update timestamp even if not modified
          saveToLocalStorage(tenantId, cacheEntry.branding, etag);
        }
      })
      .catch((error) => {
        console.error('Background refresh failed:', error);
      });

    return cacheEntry.branding;
  }

  // No cache available, fetch from API
  try {
    const { branding, etag } = await fetchBrandingFromAPI(tenantId);

    // Update caches
    cachedBranding = branding;
    cachedTenantId = tenantId;
    saveToLocalStorage(tenantId, branding, etag);

    return branding;
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);

    // Return default branding on error
    return DEFAULT_BRANDING;
  }
}

/**
 * Clear branding cache for a specific tenant or all tenants
 *
 * @param tenantId - Optional tenant ID. If not provided, clears all caches
 */
export function clearBrandingCache(tenantId?: string): void {
  // Clear in-memory cache
  if (!tenantId || cachedTenantId === tenantId) {
    cachedBranding = null;
    cachedTenantId = null;
  }

  // Clear localStorage cache
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    if (tenantId) {
      // Clear specific tenant cache
      const cacheKey = getCacheKey(tenantId);
      localStorage.removeItem(cacheKey);
    } else {
      // Clear all tenant caches
      const keysToRemove: string[] = [];

      // Collect all keys that match the prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Remove collected keys
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache status for a specific tenant
 *
 * @param tenantId - The tenant ID to check
 * @returns Cache status information
 */
export function getCacheStatus(tenantId: string): {
  exists: boolean;
  expired: boolean;
  age?: number;
  version?: string;
} {
  const cacheEntry = getFromLocalStorage(tenantId);

  if (!cacheEntry) {
    return { exists: false, expired: false };
  }

  const age = Date.now() - cacheEntry.timestamp;
  const expired = isCacheExpired(cacheEntry.timestamp);

  return {
    exists: true,
    expired,
    age,
    version: cacheEntry.version,
  };
}

/**
 * Preload branding for a tenant
 * Useful for prefetching branding before user navigates to login page
 *
 * @param tenantId - The tenant ID to preload
 */
export async function preloadBranding(tenantId: string): Promise<void> {
  try {
    await getTenantBranding(tenantId);
  } catch (error) {
    console.error('Failed to preload branding:', error);
  }
}

/**
 * Force refresh branding from API, bypassing cache
 *
 * @param tenantId - The tenant ID to refresh
 * @returns Promise<TenantBranding> - The fresh tenant branding
 */
export async function refreshBranding(tenantId: string): Promise<TenantBranding> {
  // Clear cache first
  clearBrandingCache(tenantId);

  // Fetch fresh data
  return getTenantBranding(tenantId);
}

// Helper function to get CSS variables from branding
export function getBrandingCSSVars(branding: TenantBranding): Record<string, string> {
  return {
    '--primary-color': branding.primaryColor || DEFAULT_BRANDING.primaryColor!,
    '--secondary-color': branding.secondaryColor || DEFAULT_BRANDING.secondaryColor!,
    '--accent-color': branding.accentColor || DEFAULT_BRANDING.accentColor!,
  };
}

// Helper function to get gradient style
export function getGradientStyle(branding: TenantBranding): string {
  const start = branding.loginPageConfig?.gradientStart || branding.primaryColor || '#6366f1';
  const end = branding.loginPageConfig?.gradientEnd || branding.secondaryColor || '#8b5cf6';
  return `linear-gradient(135deg, ${start}, ${end})`;
}
