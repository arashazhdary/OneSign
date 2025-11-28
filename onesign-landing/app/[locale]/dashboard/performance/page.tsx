'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card } from '@/app/components/ui';

/**
 * Performance Monitoring Dashboard
 * Displays real-time Web Vitals and performance metrics
 */

interface MetricData {
  count: number;
  average: number;
  min: number;
  max: number;
  good: number;
  needsImprovement: number;
  poor: number;
}

interface DashboardData {
  metrics: Record<string, MetricData>;
  summary: {
    totalSamples: number;
    healthScore: number;
    lastUpdated: string | null;
  };
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/vitals');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (rating: number) => {
    if (rating >= 75) return 'text-green-600 dark:text-green-400';
    if (rating >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const metricDescriptions: Record<string, string> = {
    CLS: 'Cumulative Layout Shift - Visual stability',
    FCP: 'First Contentful Paint - Initial render time',
    FID: 'First Input Delay - Interactivity',
    INP: 'Interaction to Next Paint - Responsiveness',
    LCP: 'Largest Contentful Paint - Loading performance',
    TTFB: 'Time to First Byte - Server response time',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time Core Web Vitals and performance metrics monitoring
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading metrics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
              <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </div>
          )}

          {data && (
            <>
              {/* Health Score */}
              <Card className="mb-8 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Overall Health Score
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Based on {data.summary.totalSamples} samples
                    </p>
                    {data.summary.lastUpdated && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Last updated: {new Date(data.summary.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getMetricColor(data.summary.healthScore)}`}>
                      {data.summary.healthScore}
                    </div>
                    <div className="mt-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getHealthScoreColor(data.summary.healthScore)}`}
                          style={{ width: `${data.summary.healthScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(data.metrics).map(([name, metric]) => {
                  const goodPercentage = (metric.good / metric.count) * 100;

                  return (
                    <Card key={name} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {name}
                        </h3>
                        <span className={`text-2xl font-bold ${getMetricColor(goodPercentage)}`}>
                          {Math.round(goodPercentage)}%
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {metricDescriptions[name] || 'Performance metric'}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Average:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round(metric.average)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Min / Max:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round(metric.min)}ms / {Math.round(metric.max)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Samples:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {metric.count}
                          </span>
                        </div>
                      </div>

                      {/* Distribution Bar */}
                      <div className="mt-4">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{ width: `${(metric.good / metric.count) * 100}%` }}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(metric.needsImprovement / metric.count) * 100}%` }}
                          />
                          <div
                            className="bg-red-500"
                            style={{ width: `${(metric.poor / metric.count) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-gray-600 dark:text-gray-400">
                          <span>Good: {metric.good}</span>
                          <span>Needs improvement: {metric.needsImprovement}</span>
                          <span>Poor: {metric.poor}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Info Section */}
              <Card className="mt-8 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  About Core Web Vitals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Good Thresholds:
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• LCP: ≤ 2.5s</li>
                      <li>• FID/INP: ≤ 100ms</li>
                      <li>• CLS: ≤ 0.1</li>
                      <li>• FCP: ≤ 1.8s</li>
                      <li>• TTFB: ≤ 800ms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Monitoring:
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Real user monitoring (RUM)</li>
                      <li>• Automatic refresh every 30s</li>
                      <li>• Last {data.summary.totalSamples} samples stored</li>
                      <li>• Health score based on good ratings</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
