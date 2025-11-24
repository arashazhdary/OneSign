import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { GlobalLayout } from '@/layouts/GlobalLayout';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const TenantsPage = lazy(() => import('@/pages/admin/TenantsPage'));
const RolesPage = lazy(() => import('@/pages/admin/RolesPage'));
const ApiKeysPage = lazy(() => import('@/pages/admin/ApiKeysPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// Tenant pages
const TenantDashboardPage = lazy(() => import('@/pages/tenant/DashboardPage'));
const TenantUsersPage = lazy(() => import('@/pages/tenant/UsersPage'));
const TenantAppsPage = lazy(() => import('@/pages/tenant/AppsPage'));
const TenantRolesPage = lazy(() => import('@/pages/tenant/RolesPage'));
const TenantAuditPage = lazy(() => import('@/pages/tenant/AuditPage'));
const TenantSettingsPage = lazy(() => import('@/pages/tenant/SettingsPage'));

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
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Tenant routes */}
        <Route
          path="/tenant/*"
          element={
            <ProtectedRoute>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/tenant/dashboard" replace />} />
          <Route path="dashboard" element={<TenantDashboardPage />} />
          <Route path="users" element={<TenantUsersPage />} />
          <Route path="apps" element={<TenantAppsPage />} />
          <Route path="roles" element={<TenantRolesPage />} />
          <Route path="audit" element={<TenantAuditPage />} />
          <Route path="settings" element={<TenantSettingsPage />} />
        </Route>

        {/* Global routes */}
        <Route
          path="/global/*"
          element={
            <ProtectedRoute>
              <GlobalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/global/dashboard" replace />} />
          {/* Add more global routes as needed */}
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
