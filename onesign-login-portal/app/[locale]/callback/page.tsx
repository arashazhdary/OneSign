'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(searchParams.get('error_description') || t('callback.error'));
      return;
    }

    if (code) {
      // Authorization code received - client application should exchange it for tokens
      // This page just confirms the redirect was successful
      setStatus('success');
      setMessage(t('callback.success'));
      
      // Store code and state for client application to retrieve
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onesign_authorization_code', code);
        const state = searchParams.get('state');
        if (state) {
          sessionStorage.setItem('onesign_authorization_state', state);
        }
      }
    } else {
      setStatus('error');
      setMessage(t('callback.error'));
    }
  }, [searchParams, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('callback.title')}
          </h2>
          {status === 'processing' && (
            <div>
              <p className="text-gray-600 mb-4">{t('callback.processing')}</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}
          {status === 'success' && (
            <div>
              <p className="text-green-600 mb-4">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div>
              <p className="text-red-600 mb-4">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

