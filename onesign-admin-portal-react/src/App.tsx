import { Suspense } from 'react';
import { Routes, Route, Navigate, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDirection } from '@/hooks/useDirection';
import { routes } from '@/routes/routes';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  // Initialize direction based on i18n language
  useDirection();

  const routing = useRoutes([
    ...routes,
    // Default redirects
    { path: '/', element: <Navigate to="/tenant/dashboard" replace /> },
    { path: '*', element: <Navigate to="/tenant/dashboard" replace /> },
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      {routing}
    </Suspense>
  );
}

export default App;
