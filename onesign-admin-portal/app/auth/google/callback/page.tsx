'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { authService } from '@/lib/api/services/auth.service';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('Google authentication was cancelled or failed');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setError('Invalid callback: missing authorization code');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const response = await authService.googleLogin({ code, redirectUri });

        // Check if user needs to set up password
        if (response.requiresPasswordSetup && response.setupToken) {
          router.push(`/complete-first-login?token=${response.setupToken}`);
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to complete Google sign in');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <>
      <LoadingOverlay isLoading={!error} message="Completing Google sign in..." />
      {error && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full blur-xl opacity-30"></div>
                    <svg
                      className="w-20 h-20 text-red-500 relative"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <p className="text-gray-500 text-xs">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
