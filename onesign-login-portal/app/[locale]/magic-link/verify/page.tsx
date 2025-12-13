'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTenantBranding, TenantBranding, DEFAULT_BRANDING, getGradientStyle } from '@/lib/tenant-branding';

export default function MagicLinkVerifyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);

  const token = searchParams.get('token');
  const tenantId = searchParams.get('tenantId');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  useEffect(() => {
    // Fetch tenant branding
    if (tenantId) {
      getTenantBranding(tenantId).then((data) => {
        setBranding(data);
      });
    }
  }, [tenantId]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError(t('magicLink.invalidToken'));
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const response = await fetch(
          `${baseUrl}/api/auth/magic-link/verify?token=${token}${clientId ? `&clientId=${clientId}` : ''}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          setError(data.errorMessage || t('magicLink.verificationFailed'));
          setLoading(false);
          return;
        }

        const data = await response.json();

        // If OIDC flow, redirect to authorize endpoint
        if (clientId && redirectUri && tenantId) {
          const authorizeUrl = new URL(`${baseUrl}/connect/authorize`);
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
          // Regular login - redirect to dashboard or home
          router.push('/');
        }
      } catch (err) {
        setError(t('common.error'));
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, clientId, redirectUri, state, codeChallenge, codeChallengeMethod, tenantId, router, t]);

  const gradientStyle = getGradientStyle(branding);
  const primaryColor = branding.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 max-w-md w-full px-6"
      >
        {loading ? (
          <>
            <div className="relative">
              <motion.img
                src="/logo.svg"
                alt="OneSign"
                className="w-24 h-24"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-full animate-ping opacity-15" style={{ background: gradientStyle }} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{t('magicLink.verifying')}</h2>
              <p className="text-white/60">{t('magicLink.verifyingSubtitle')}</p>
            </div>
          </>
        ) : (
          <>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-red-500"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{t('magicLink.verificationFailed')}</h2>
              <p className="text-white/60 mb-6">{error}</p>
              <a
                href={`/${locale}/login${tenantId ? `?tenantId=${tenantId}` : ''}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ background: gradientStyle }}
              >
                {t('magicLink.backToLogin')}
              </a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
