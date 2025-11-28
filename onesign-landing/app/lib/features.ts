/**
 * Feature Flags System
 * Simple, type-safe feature flag management
 */

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableDarkMode: boolean;
  enableNewLanding: boolean;
  enableContactForm: boolean;
  enableLiveChat: boolean;
  enableNewsletter: boolean;
  enableBlog: boolean;
  enablePWA: boolean;
}

// Default feature flags
const defaultFlags: FeatureFlags = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDarkMode: true,
  enableNewLanding: true,
  enableContactForm: true,
  enableLiveChat: false,
  enableNewsletter: false,
  enableBlog: false,
  enablePWA: true,
};

// Get feature flags from environment or defaults
export function getFeatureFlags(): FeatureFlags {
  return {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
    enableNewLanding: process.env.NEXT_PUBLIC_ENABLE_NEW_LANDING !== 'false',
    enableContactForm: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM !== 'false',
    enableLiveChat: process.env.NEXT_PUBLIC_ENABLE_LIVE_CHAT === 'true',
    enableNewsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER === 'true',
    enableBlog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false',
  };
}

// Check if a feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

// Get all enabled features
export function getEnabledFeatures(): string[] {
  const flags = getFeatureFlags();
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}

// Get all disabled features
export function getDisabledFeatures(): string[] {
  const flags = getFeatureFlags();
  return Object.entries(flags)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
}

// Export flags for direct access
export const featureFlags = getFeatureFlags();
