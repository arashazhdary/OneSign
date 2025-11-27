import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    service: 'onesign-landing',
  };

  return NextResponse.json(healthCheck, { status: 200 });
}

export const dynamic = 'force-dynamic';
