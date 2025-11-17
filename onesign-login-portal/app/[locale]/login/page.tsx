'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTenantId, setTenantId } from '@/lib/tenant-context';
import { getTenantBranding, TenantBranding } from '@/lib/tenant-branding';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          {logoUrl && (
            <div className="flex justify-center mb-4">
              <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
            </div>
          )}
          <h2 
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            style={{ color: primaryColor }}
          >
            {t('login.title')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('common.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('common.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href={`/${locale}/forgot-password`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('login.forgotPassword')}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ 
                backgroundColor: primaryColor,
                '--hover-color': `${primaryColor}dd` 
              } as React.CSSProperties & { '--hover-color': string }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              {loading ? t('common.loading') : t('login.signIn')}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {t('login.signInWithGoogle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

