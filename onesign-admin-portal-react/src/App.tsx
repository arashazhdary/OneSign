import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDirection } from '@/hooks/useDirection';
import { useTranslation } from 'react-i18next';
import { routes } from '@/routes/routes';

// Loading component
const LoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
      </div>
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { t } = useTranslation();
  
  // Initialize direction based on i18n language
  // Wrap in try-catch to prevent crashes if i18n is not ready
  try {
    useDirection();
  } catch (error) {
    console.warn('Failed to initialize direction:', error);
  }

  const routing = useRoutes([
    ...routes,
    // Default redirects
    { path: '/', element: <Navigate to="/tenant/dashboard" replace /> },
    { path: '*', element: <Navigate to="/tenant/dashboard" replace /> },
  ]);

  // Log routing for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('✅ App component rendered');
      console.log('📍 Current path:', window.location.pathname);
      console.log('🔀 Routing element:', routing);
    }
  }, [routing]);

  // If routing is null, show error
  if (!routing) {
    console.error('❌ Routing is null!');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.routingError')}</h1>
          <p className="text-slate-600">{t('common.failedToInitializeRouting')}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {routing}
    </Suspense>
  );
}

export default App;
