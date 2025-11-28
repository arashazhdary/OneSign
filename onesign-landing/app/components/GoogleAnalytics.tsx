'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Google Analytics Integration Component
 * Tracks page views and custom events
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track page view
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Track custom events
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track page views manually
 */
export const trackPageView = (url: string) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

/**
 * Common event trackers
 */
export const analytics = {
  // Track button clicks
  trackButtonClick: (buttonName: string, location: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location,
    });
  },

  // Track form submissions
  trackFormSubmit: (formName: string, success: boolean) => {
    trackEvent('form_submit', {
      form_name: formName,
      success: success,
    });
  },

  // Track newsletter signups
  trackNewsletterSignup: (location: string) => {
    trackEvent('newsletter_signup', {
      location: location,
    });
  },

  // Track contact form
  trackContactForm: (success: boolean) => {
    trackEvent('contact_form', {
      success: success,
    });
  },

  // Track pricing plan view
  trackPricingView: (plan: string) => {
    trackEvent('pricing_view', {
      plan: plan,
    });
  },

  // Track CTA clicks
  trackCTAClick: (cta: string, page: string) => {
    trackEvent('cta_click', {
      cta_name: cta,
      page: page,
    });
  },

  // Track downloads
  trackDownload: (fileName: string) => {
    trackEvent('file_download', {
      file_name: fileName,
    });
  },

  // Track outbound links
  trackOutboundLink: (url: string, linkText: string) => {
    trackEvent('outbound_link', {
      url: url,
      link_text: linkText,
    });
  },

  // Track scroll depth
  trackScrollDepth: (depth: number, page: string) => {
    trackEvent('scroll_depth', {
      depth: depth,
      page: page,
    });
  },

  // Track errors
  trackError: (errorMessage: string, errorLocation: string) => {
    trackEvent('error', {
      error_message: errorMessage,
      error_location: errorLocation,
    });
  },
};
