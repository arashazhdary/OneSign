/**
 * Analytics utilities for tracking user interactions
 * Supports Google Analytics and custom events
 */

// Type definitions
export type EventParams = {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

export type PageViewParams = {
  page_path: string;
  page_title?: string;
  page_location?: string;
};

// Initialize analytics
export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  const gaId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  // Initialize Google Analytics
  if (gaId && window.gtag) {
    window.gtag('config', gaId, {
      page_path: window.location.pathname,
    });
  }

  // Initialize Google Tag Manager
  if (gtmId && window.dataLayer) {
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
  }
};

// Track page views
export const trackPageView = (params: PageViewParams) => {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) return;

  const gaId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  if (gaId && window.gtag) {
    window.gtag('config', gaId, params);
  }

  // Also send to GTM
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      ...params,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, params?: EventParams) => {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Google Tag Manager
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, params);
  }
};

// Predefined event trackers
export const analytics = {
  // Track CTA clicks
  trackCTA: (ctaName: string, location: string) => {
    trackEvent('cta_click', {
      category: 'engagement',
      label: ctaName,
      location,
    });
  },

  // Track feature views
  trackFeatureView: (featureName: string) => {
    trackEvent('feature_view', {
      category: 'engagement',
      label: featureName,
    });
  },

  // Track pricing tier selection
  trackPricingView: (tier: string) => {
    trackEvent('pricing_view', {
      category: 'conversion',
      label: tier,
    });
  },

  // Track language change
  trackLanguageChange: (from: string, to: string) => {
    trackEvent('language_change', {
      category: 'localization',
      from,
      to,
    });
  },

  // Track scroll depth
  trackScrollDepth: (percentage: number) => {
    trackEvent('scroll_depth', {
      category: 'engagement',
      value: percentage,
    });
  },

  // Track outbound links
  trackOutboundLink: (url: string) => {
    trackEvent('outbound_link', {
      category: 'engagement',
      label: url,
    });
  },
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
