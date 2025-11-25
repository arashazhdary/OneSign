import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Helmet } from 'react-helmet-async';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { googleLogin } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication was cancelled or failed');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('Invalid callback: missing authorization code');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        await googleLogin({ code, redirectUri });

        // Navigate to dashboard on success
        navigate('/admin/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to complete Google sign in');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, googleLogin]);

  if (isLoading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Completing Google sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-md w-full">
          <div className="glass-strong rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full blur-xl opacity-30"></div>
                  <AlertTriangle className="w-20 h-20 text-red-500 relative" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.authenticationFailed')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                {t('auth.redirectingToLogin')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallbackPage;
