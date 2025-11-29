'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Skeleton loading components
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <TextSkeleton lines={3} />
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return <Skeleton className="h-12 w-12 rounded-full" />;
}

export function ButtonSkeleton() {
  return <Skeleton className="h-10 w-24" />;
}

// Spinner component
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
    />
  );
}

// Full page loader
export function PageLoader() {
  const t = useTranslations('common');

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    </div>
  );
}

// Content loader with logo
export function ContentLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6 animate-pulse">
          <Image
            src="/onesign-logo.png"
            alt="OneSign Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          OneSign
        </h2>
        <Spinner size="md" />
      </div>
    </div>
  );
}

// Inline loader for buttons
export function InlineLoader() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>{t('loading')}</span>
    </div>
  );
}
