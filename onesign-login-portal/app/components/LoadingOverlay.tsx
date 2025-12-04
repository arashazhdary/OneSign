'use client';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = 'Processing...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <img src="/logo.svg" alt="Loading" className="w-16 h-16 relative animate-pulse" />
          </div>

          {/* Loading Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>

          {/* Message */}
          <p className="text-gray-700 dark:text-slate-200 font-medium text-center">{message}</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center">Please wait...</p>
        </div>
      </div>
    </div>
  );
}
