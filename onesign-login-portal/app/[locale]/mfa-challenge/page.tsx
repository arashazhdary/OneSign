'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTenantBranding, TenantBranding } from '@/lib/tenant-branding';

export default function MfaChallengePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [branding, setBranding] = useState<TenantBranding>({});

  const challengeId = searchParams.get('challengeId');
  const methodType = searchParams.get('methodType');
  const tenantId = searchParams.get('tenantId');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  useEffect(() => {
    if (tenantId) {
      getTenantBranding(tenantId).then(setBranding);
    }
  }, [tenantId]);

  const getMethodName = () => {
    switch (methodType) {
      case '1':
        return t('mfa.methodTotp');
      case '2':
        return t('mfa.methodEmail');
      case '3':
        return t('mfa.methodSms');
      default:
        return t('mfa.methodGeneric');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!challengeId || !tenantId) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }

      // Generate device fingerprint (simple version)
      const deviceFingerprint = rememberDevice
        ? btoa(`${navigator.userAgent}-${window.screen.width}x${window.screen.height}`)
        : undefined;

      const response = await fetch('http://localhost:7000/api/tenant/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          code,
          rememberDevice,
          deviceFingerprint,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.errorMessage || t('mfa.invalidCode'));
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(t('mfa.invalidCode'));
        setLoading(false);
        return;
      }

      // MFA verification successful - proceed with login flow
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
  };

  const primaryColor = branding.primaryColor || '#4F46E5';
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
            {t('mfa.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('mfa.enterCode')} {getMethodName()}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="code" className="sr-only">
              {t('mfa.code')}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-device"
              name="remember-device"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-900">
              {t('mfa.rememberDevice')}
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{
                backgroundColor: primaryColor,
                '--hover-color': `${primaryColor}dd`
              } as React.CSSProperties & { '--hover-color': string }}
              onMouseEnter={(e) => {
                if (!loading && code.length === 6) {
                  e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              {loading ? t('common.loading') : t('mfa.verify')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/login`)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {t('mfa.backToLogin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
