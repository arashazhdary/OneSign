import { NextResponse } from 'next/server';

/**
 * Web Vitals Analytics Endpoint
 * Collects and stores Core Web Vitals metrics
 */

interface VitalsPayload {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  userAgent: string;
  timestamp: number;
}

// In-memory storage for development (use database in production)
const metricsStore: VitalsPayload[] = [];
const MAX_METRICS = 1000;

export async function POST(request: Request) {
  try {
    const payload: VitalsPayload = await request.json();

    // Validate payload
    if (!payload.metric || typeof payload.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Store metric
    metricsStore.push({
      ...payload,
      timestamp: Date.now(),
    });

    // Keep only last MAX_METRICS entries
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals API] Received metric:', {
        metric: payload.metric,
        value: Math.round(payload.value),
        rating: payload.rating,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Calculate averages by metric
    const metrics = metricsStore.reduce((acc, entry) => {
      if (!acc[entry.metric]) {
        acc[entry.metric] = {
          count: 0,
          total: 0,
          average: 0,
          min: Infinity,
          max: -Infinity,
          good: 0,
          needsImprovement: 0,
          poor: 0,
        };
      }

      const metric = acc[entry.metric];
      metric.count++;
      metric.total += entry.value;
      metric.min = Math.min(metric.min, entry.value);
      metric.max = Math.max(metric.max, entry.value);

      if (entry.rating === 'good') metric.good++;
      else if (entry.rating === 'needs-improvement') metric.needsImprovement++;
      else if (entry.rating === 'poor') metric.poor++;

      metric.average = metric.total / metric.count;

      return acc;
    }, {} as Record<string, any>);

    // Calculate overall health score
    const totalMetrics = Object.keys(metrics).length;
    const healthScore = totalMetrics > 0
      ? Object.values(metrics).reduce((sum: number, m: any) => {
          return sum + ((m.good / m.count) * 100);
        }, 0) / totalMetrics
      : 0;

    return NextResponse.json({
      metrics,
      summary: {
        totalSamples: metricsStore.length,
        healthScore: Math.round(healthScore),
        lastUpdated: metricsStore.length > 0
          ? new Date(metricsStore[metricsStore.length - 1].timestamp).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
