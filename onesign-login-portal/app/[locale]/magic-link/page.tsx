'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getTenantId, getTenantIdAsync, setTenantId } from '@/lib/tenant-context';
import { getTenantBranding, TenantBranding, DEFAULT_BRANDING, getGradientStyle } from '@/lib/tenant-branding';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import ImageSlider, { DEFAULT_SLIDER_IMAGES } from '@/app/components/ImageSlider';

export default function MagicLinkPage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  // Form state
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Tenant state
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // RTL detection
  const isRTL = useMemo(() => ['fa', 'ar', 'he'].includes(locale), [locale]);

  useEffect(() => {
    // Get tenant ID from URL or context
    const urlTenantId = searchParams.get('tenantId');
    if (urlTenantId) {
      setTenantId(urlTenantId);
      setTenantIdState(urlTenantId);
    } else {
      getTenantIdAsync().then((resolvedTenantId) => {
        if (resolvedTenantId) {
          setTenantIdState(resolvedTenantId);
        } else {
          setTenantIdState('00000000-0000-0000-0000-000000000000');
        }
      });
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch tenant branding
    if (tenantId) {
      getTenantBranding(tenantId).then((data) => {
        setBranding(data);
        setPageLoading(false);
      });
    }
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      setError(t('common.error'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
      const response = await fetch(`${baseUrl}/api/auth/magic-link?tenantId=${tenantId}`, {
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

  // Dynamic styles based on branding
  const primaryColor = branding.primaryColor || '#6366f1';
  const secondaryColor = branding.secondaryColor || '#8b5cf6';
  const gradientStyle = getGradientStyle(branding);
  const logoUrl = branding.logoUrl;
  const loginConfig = branding.loginPageConfig || DEFAULT_BRANDING.loginPageConfig!;
  const sliderImages = loginConfig.sliderImages || DEFAULT_SLIDER_IMAGES;
  const formPosition = loginConfig.formPosition || 'right';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Page loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: gradientStyle }}
            >
              <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <p className="text-white/60 text-sm">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <>
        <LoadingOverlay isLoading={loading} message={t('common.loading')} />

        <div className={`min-h-screen flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Slider Section - Hidden on mobile */}
          <div
            className={`hidden lg:block lg:w-1/2 xl:w-3/5 relative ${
              formPosition === 'left' ? 'order-2' : 'order-1'
            }`}
          >
            {loginConfig.backgroundType === 'slider' ? (
              <ImageSlider
                images={sliderImages}
                autoPlay={loginConfig.sliderAutoPlay ?? true}
                interval={loginConfig.sliderInterval ?? 5000}
                tenantName={branding.tenantName}
                tenantLogo={branding.logoDarkUrl || branding.logoUrl}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: gradientStyle }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            )}
          </div>

          {/* Success Message Section */}
          <div
            className={`w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-900 ${
              formPosition === 'left' ? 'order-1' : 'order-2'
            }`}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-md text-center"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: gradientStyle }}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {t('magicLink.checkYourEmail')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('magicLink.emailSent')}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('magicLink.linkExpiresIn')}
                  </p>
                </div>

                <Link
                  href={`/${locale}/login${window.location.search}`}
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
                  style={{ color: primaryColor }}
                >
                  <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('magicLink.backToLogin')}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Background */}
          <div
            className="lg:hidden fixed inset-0 -z-10"
            style={{ background: gradientStyle }}
          >
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" />
          </div>
        </div>
      </>
    );
  }

  // Request form
  return (
    <>
      <LoadingOverlay isLoading={loading} message={t('magicLink.sendingLink')} />

      <div className={`min-h-screen flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Slider Section - Hidden on mobile */}
        <div
          className={`hidden lg:block lg:w-1/2 xl:w-3/5 relative ${
            formPosition === 'left' ? 'order-2' : 'order-1'
          }`}
        >
          {loginConfig.backgroundType === 'slider' ? (
            <ImageSlider
              images={sliderImages}
              autoPlay={loginConfig.sliderAutoPlay ?? true}
              interval={loginConfig.sliderInterval ?? 5000}
              tenantName={branding.tenantName}
              tenantLogo={branding.logoDarkUrl || branding.logoUrl}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: gradientStyle }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          )}
        </div>

        {/* Form Section */}
        <div
          className={`w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-900 ${
            formPosition === 'left' ? 'order-1' : 'order-2'
          }`}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="flex justify-center mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt={branding.tenantName || 'Logo'} className="h-12 object-contain" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: gradientStyle }}
                  >
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {t('magicLink.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {t('magicLink.subtitle')}
              </p>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Magic Link Request Form */}
            <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('common.email')}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none transition-colors duration-200`}
                  >
                    <svg
                      className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-indigo-500' : 'text-slate-400'
                      }`}
                      style={focusedField === 'email' ? { color: primaryColor } : {}}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-700 ${
                      focusedField === 'email'
                        ? 'border-transparent ring-2'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={focusedField === 'email' ? { '--tw-ring-color': primaryColor } as any : {}}
                    placeholder={t('magicLink.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  background: gradientStyle,
                  '--tw-ring-color': primaryColor,
                } as any}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('magicLink.sendLink')}</span>
                    <svg
                      className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </>
                )}
              </motion.button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href={`/${locale}/login${window.location.search}`}
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: primaryColor }}
                >
                  {t('magicLink.backToLogin')}
                </Link>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Mobile Background */}
        <div
          className="lg:hidden fixed inset-0 -z-10"
          style={{ background: gradientStyle }}
        >
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" />
        </div>
      </div>
    </>
  );
}
