import React from 'react';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  retry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage,
  errorMessage,
  retry,
  children,
  skeleton,
}) => {
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {t('common.error')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {errorMessage || error.message || t('common.errorOccurred')}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {t('common.noData')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {emptyMessage || t('common.noDataAvailable')}
          </p>
        </div>
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
};

export default LoadingState;
