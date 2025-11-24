'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { getTenantId, setTenantId } from '@/lib/tenant-context';
import { useSearchParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlTenantId = searchParams.get('tenantId');
    if (urlTenantId) {
      setTenantId(urlTenantId);
      setTenantIdState(urlTenantId);
    } else {
      const contextTenantId = getTenantId();
      if (contextTenantId) {
        setTenantIdState(contextTenantId);
      } else {
        setTenantIdState('00000000-0000-0000-0000-000000000000');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      setError(t('common.error'));
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      
      const response = await fetch(`http://localhost:9091/api/auth/forgot-password?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('forgotPassword.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('forgotPassword.resetLinkSent')}
            </p>
            <Link
              href={`/${locale}/login`}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forgotPassword.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('forgotPassword.description')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('common.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('forgotPassword.sendResetLink')}
            </button>
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/login`}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

