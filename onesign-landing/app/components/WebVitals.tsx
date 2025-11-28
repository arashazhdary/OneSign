'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Monitoring Component
 * Tracks Core Web Vitals and reports them to analytics
 */

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Send metrics to analytics endpoint
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Use beacon API for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body);
    } else {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }
}

/**
 * Web Vitals Component
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Only track Core Web Vitals
    if (['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'].includes(metric.name)) {
      sendToAnalytics(metric as WebVitalsMetric);
    }
  });

  return null;
}

/**
 * Custom hook for Web Vitals monitoring
 */
export function useWebVitalsMonitoring() {
  useEffect(() => {
    // Monitor long tasks (tasks that take more than 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[Performance] Long task detected:', {
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
      } catch (e) {
        // Long task observer not supported
      }
    }
  }, []);

  useEffect(() => {
    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput && layoutShift.value > 0.1) {
              console.warn('[Performance] Layout shift detected:', {
                value: layoutShift.value.toFixed(4),
                sources: layoutShift.sources?.length || 0,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        return () => observer.disconnect();
      } catch (e) {
        // Layout shift observer not supported
      }
    }
  }, []);

  return null;
}

/**
 * Performance metrics display (for development)
 */
export function WebVitalsDisplay() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const displayMetrics = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          console.table({
            'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
            'TCP Connection': Math.round(navigation.connectEnd - navigation.connectStart),
            'TLS Negotiation': Math.round(navigation.secureConnectionStart > 0
              ? navigation.connectEnd - navigation.secureConnectionStart
              : 0),
            'Request Time': Math.round(navigation.responseStart - navigation.requestStart),
            'Response Time': Math.round(navigation.responseEnd - navigation.responseStart),
            'DOM Processing': Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
            'Load Event': Math.round(navigation.loadEventEnd - navigation.loadEventStart),
            'Total Load Time': Math.round(navigation.loadEventEnd - navigation.fetchStart),
          });
        }

        // Paint metrics
        const paint = performance.getEntriesByType('paint');
        if (paint.length > 0) {
          console.table(
            paint.reduce((acc, entry) => {
              acc[entry.name] = `${Math.round(entry.startTime)}ms`;
              return acc;
            }, {} as Record<string, string>)
          );
        }
      }
    };

    // Display after page load
    if (document.readyState === 'complete') {
      displayMetrics();
    } else {
      window.addEventListener('load', displayMetrics);
      return () => window.removeEventListener('load', displayMetrics);
    }
  }, []);

  return null;
}
