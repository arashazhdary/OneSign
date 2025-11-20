'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTenantId, setTenantId } from '@/lib/tenant-context';
import { getTenantBranding, TenantBranding } from '@/lib/tenant-branding';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import LoadingSpinner from '@/app/components/LoadingSpinner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<TenantBranding>({});

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    // Get tenant ID from URL or context
    const urlTenantId = searchParams.get('tenantId');
    if (urlTenantId) {
      setTenantId(urlTenantId);
      setTenantIdState(urlTenantId);
    } else {
      const contextTenantId = getTenantId();
      if (contextTenantId) {
        setTenantIdState(contextTenantId);
      } else {
        // Default placeholder for Phase 1
        setTenantIdState('00000000-0000-0000-0000-000000000000');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch tenant branding
    if (tenantId) {
      getTenantBranding(tenantId).then(setBranding);
    }
  }, [tenantId]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            if (!tenantId) {
              setError(t('common.error'));
              setLoading(false);
              return;
            }
            
            const loginResponse = await fetch(`http://localhost:7000/api/auth/google-login?tenantId=${tenantId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                idToken: response.credential,
                clientId: clientId ? clientId : undefined
              }),
            });

            if (!loginResponse.ok) {
              const data = await loginResponse.json();
              setError(data.errorMessage || t('login.invalidCredentials'));
              setLoading(false);
              return;
            }

            const data = await loginResponse.json();
            
            // If OIDC flow, redirect to authorize endpoint
            if (clientId && redirectUri) {
              const authorizeUrl = new URL('http://localhost:7000/connect/authorize');
              authorizeUrl.searchParams.set('client_id', clientId);
              authorizeUrl.searchParams.set('redirect_uri', redirectUri);
              authorizeUrl.searchParams.set('response_type', 'code');
              authorizeUrl.searchParams.set('scope', 'openid profile email');
              if (state) authorizeUrl.searchParams.set('state', state);
              if (codeChallenge) authorizeUrl.searchParams.set('code_challenge', codeChallenge);
              if (codeChallengeMethod) authorizeUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
              authorizeUrl.searchParams.set('tenantId', tenantId);
              
              window.location.href = authorizeUrl.toString();
            } else {
              router.push('/');
            }
          } catch (err) {
            setError(t('common.error'));
            setLoading(false);
          }
        }
      });

      window.google.accounts.id.prompt();
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!tenantId) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:7000/api/auth/login?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.errorMessage || t('login.invalidCredentials'));
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Check if MFA is required
      if (data.mfaRequired) {
        // Redirect to MFA challenge page
        const mfaUrl = `/${locale}/mfa-challenge?challengeId=${data.challengeId}&methodType=${data.mfaMethodType}&tenantId=${tenantId}`;
        if (clientId) {
          router.push(`${mfaUrl}&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state || ''}&code_challenge=${codeChallenge || ''}&code_challenge_method=${codeChallengeMethod || ''}`);
        } else {
          router.push(mfaUrl);
        }
        setLoading(false);
        return;
      }

      // If OIDC flow, redirect to authorize endpoint
      if (clientId && redirectUri) {
        const authorizeUrl = new URL('http://localhost:7000/connect/authorize');
        authorizeUrl.searchParams.set('client_id', clientId);
        authorizeUrl.searchParams.set('redirect_uri', redirectUri);
        authorizeUrl.searchParams.set('response_type', 'code');
        authorizeUrl.searchParams.set('scope', 'openid profile email');
        if (state) authorizeUrl.searchParams.set('state', state);
        if (codeChallenge) authorizeUrl.searchParams.set('code_challenge', codeChallenge);
        if (codeChallengeMethod) authorizeUrl.searchParams.set('code_challenge_method', codeChallengeMethod);
        authorizeUrl.searchParams.set('tenantId', tenantId);

        // Authorization code will be handled by the callback page
        window.location.href = authorizeUrl.toString();
      } else {
        // Regular login - redirect to dashboard or home
        router.push('/');
      }
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const primaryColor = branding.primaryColor || '#4F46E5'; // Default indigo
  const logoUrl = branding.logoUrl;

  return (
    <>
      <LoadingOverlay isLoading={loading} message="Signing you in..." />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-md w-full">
          {/* Modern Card with Glass Effect */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
            {/* Logo and Title Section */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
                  <img src={logoUrl || "/logo.svg"} alt="OneSign Logo" className="h-20 w-20 relative" />
                </div>
              </div>
              <h1
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                {t('login.title')}
              </h1>
              <p className="text-gray-600 text-sm">
                Welcome back! Please enter your credentials
              </p>
            </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('common.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('common.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <a
                href={`/${locale}/forgot-password`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {t('login.forgotPassword')}
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('login.signIn')}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{t('login.signInWithGoogle')}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
    </>
  );
}

