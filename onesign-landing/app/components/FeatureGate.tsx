'use client';

import { ReactNode } from 'react';
import { isFeatureEnabled, FeatureFlags } from '@/app/lib/features';

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
