import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface LoadingOverlayProps {
  isVisible?: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = true,
  message,
  className,
}) => {
  const { t } = useTranslation();
  const defaultMessage = message || t('common.loading');
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-700 dark:text-gray-300">{defaultMessage}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
