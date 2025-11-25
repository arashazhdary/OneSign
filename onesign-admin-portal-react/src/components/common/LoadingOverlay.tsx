import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingOverlayProps {
  isVisible?: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = true,
  message = 'Loading...',
  className,
}) => {
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
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
