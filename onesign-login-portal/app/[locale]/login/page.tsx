'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId, getTenantIdAsync, setTenantId } from '@/lib/tenant-context';
import { getTenantBranding, TenantBranding, DEFAULT_BRANDING, getGradientStyle } from '@/lib/tenant-branding';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import ImageSlider, { DEFAULT_SLIDER_IMAGES } from '@/app/components/ImageSlider';
import ValidationIcon from '@/app/components/ValidationIcon';
import PasswordStrengthMeter from '@/app/components/PasswordStrengthMeter';
import { useFormValidation, PasswordStrength } from '@/hooks/useFormValidation';
import { useDarkMode } from '@/hooks/useDarkMode';
import DarkModeToggle from '@/app/components/DarkModeToggle';
import { getDeviceFingerprint, markDeviceAsTrusted } from '@/lib/device-fingerprint';

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
    msal?: any;
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form validation hook
  const {
    fields,
    registerField,
    updateField,
    touchField,
    validateEmail,
    validatePassword,
    calculatePasswordStrength,
    isFormValid,
  } = useFormValidation({
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
  });

  // Form state
  const [rememberMe, setRememberMe] = useState(false);
  const [trustThisDevice, setTrustThisDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    percentage: 0,
  });

  // Device fingerprint state
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Tenant state
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // OAuth params
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  // RTL detection
  const isRTL = useMemo(() => ['fa', 'ar', 'he'].includes(locale), [locale]);

  // Dark mode hook
  useDarkMode();

  // Register form fields on mount
  useEffect(() => {
    registerField('email', '');
    registerField('password', '');
  }, [registerField]);

  // Generate device fingerprint on mount
  useEffect(() => {
    getDeviceFingerprint().then((fingerprint) => {
      setDeviceFingerprint(fingerprint);
    });
  }, []);

  useEffect(() => {
    // Get tenant ID from URL or context
    const urlTenantId = searchParams.get('tenantId');
    if (urlTenantId) {
      setTenantId(urlTenantId);
      setTenantIdState(urlTenantId);
    } else {
      // Try async lookup (subdomain, etc.)
      getTenantIdAsync().then((resolvedTenantId) => {
        if (resolvedTenantId) {
          setTenantIdState(resolvedTenantId);
        } else {
          // Fallback to default tenant for development
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

        // Load reCAPTCHA script if enabled for this tenant
        if (data.features?.enableRecaptcha && data.features?.recaptchaSiteKey) {
          const script = document.createElement('script');
          script.src = `https://www.google.com/recaptcha/api.js?render=${data.features.recaptchaSiteKey}`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
      });
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
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response: any) => {
            try {
              if (!tenantId) {
                setError(t('common.error'));
                setLoading(false);
                return;
              }

              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
              const loginResponse = await fetch(`${baseUrl}/api/auth/google-login?tenantId=${tenantId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  idToken: response.credential,
                  clientId: clientId ? clientId : undefined,
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
                router.push('/');
              }
            } catch (err) {
              setError(t('common.error'));
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.prompt();
      }
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!tenantId) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }

      // Load MSAL library if not already loaded
      if (!window.msal) {
        const script = document.createElement('script');
        script.src = 'https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const msalConfig = {
        auth: {
          clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin + `/${locale}/login`,
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false,
        },
      };

      const msalInstance = new window.msal.PublicClientApplication(msalConfig);
      await msalInstance.initialize();

      const loginRequest = {
        scopes: ['openid', 'profile', 'email', 'User.Read'],
      };

      try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);

        if (loginResponse && loginResponse.idToken) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
          const apiResponse = await fetch(`${baseUrl}/api/auth/microsoft-login?tenantId=${tenantId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: loginResponse.idToken,
              clientId: clientId ? clientId : undefined,
            }),
          });

          if (!apiResponse.ok) {
            const data = await apiResponse.json();
            setError(data.errorMessage || t('login.invalidCredentials'));
            setLoading(false);
            return;
          }

          const data = await apiResponse.json();

          // If OIDC flow, redirect to authorize endpoint
          if (clientId && redirectUri) {
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
            router.push('/');
          }
        }
      } catch (msalError: any) {
        console.error('Microsoft login error:', msalError);
        if (msalError.errorCode !== 'user_cancelled') {
          setError(t('common.error'));
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Microsoft login error:', err);
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!tenantId) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }

      // Load Apple JS SDK if not already loaded
      if (!window.AppleID) {
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Apple Sign In
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: process.env.NEXT_PUBLIC_APPLE_SERVICE_ID || '',
          scope: 'name email',
          redirectURI: window.location.origin + `/${locale}/login`,
          state: 'origin:web',
          usePopup: true,
        });

        try {
          const response = await window.AppleID.auth.signIn();

          if (response && response.authorization && response.authorization.id_token) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
            const apiResponse = await fetch(`${baseUrl}/api/auth/apple-login?tenantId=${tenantId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                idToken: response.authorization.id_token,
                clientId: clientId ? clientId : undefined,
              }),
            });

            if (!apiResponse.ok) {
              const data = await apiResponse.json();
              setError(data.errorMessage || t('login.invalidCredentials'));
              setLoading(false);
              return;
            }

            const data = await apiResponse.json();

            // If OIDC flow, redirect to authorize endpoint
            if (clientId && redirectUri) {
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
              router.push('/');
            }
          }
        } catch (appleError: any) {
          console.error('Apple login error:', appleError);
          if (appleError.error !== 'popup_closed_by_user') {
            setError(t('common.error'));
          }
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Apple login error:', err);
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    const emailField = fields.email;
    const passwordField = fields.password;

    if (!emailField || !passwordField || !emailField.isValid || !passwordField.isValid) {
      // Touch all fields to show errors
      touchField('email', validateEmail);
      touchField('password', validatePassword);
      setError(t('login.invalidCredentials'));
      return;
    }

    setLoading(true);

    try {
      if (!tenantId) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }

      // Execute reCAPTCHA if enabled
      let recaptchaToken: string | undefined;
      if (branding.features?.enableRecaptcha && branding.features?.recaptchaSiteKey) {
        try {
          if (window.grecaptcha) {
            recaptchaToken = await new Promise<string>((resolve, reject) => {
              window.grecaptcha!.ready(async () => {
                try {
                  const token = await window.grecaptcha!.execute(branding.features!.recaptchaSiteKey!, {
                    action: 'login',
                  });
                  resolve(token);
                } catch (error) {
                  reject(error);
                }
              });
            });
          }
        } catch (error) {
          console.error('reCAPTCHA execution failed:', error);
          setError(t('login.recaptchaError') || 'reCAPTCHA verification failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
      const response = await fetch(`${baseUrl}/api/auth/login?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailField.value,
          password: passwordField.value,
          recaptchaToken: recaptchaToken,
          deviceFingerprint: deviceFingerprint,
          trustThisDevice: trustThisDevice
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.errorMessage || t('login.invalidCredentials'));
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Mark device as trusted in localStorage if checkbox was checked
      if (trustThisDevice && deviceFingerprint) {
        markDeviceAsTrusted();
      }

      // Check if MFA is required
      if (data.mfaRequired) {
        // Redirect to MFA challenge page
        const mfaUrl = `/${locale}/mfa-challenge?challengeId=${data.challengeId}&methodType=${data.mfaMethodType}&tenantId=${tenantId}`;
        if (clientId) {
          router.push(
            `${mfaUrl}&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state || ''}&code_challenge=${codeChallenge || ''}&code_challenge_method=${codeChallengeMethod || ''}`
          );
        } else {
          router.push(mfaUrl);
        }
        setLoading(false);
        return;
      }

      // If OIDC flow, redirect to authorize endpoint
      if (clientId && redirectUri) {
        const authorizeUrl = new URL(`${baseUrl}/connect/authorize`);
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

  // Dynamic styles based on branding
  const primaryColor = branding.primaryColor || '#6366f1';
  const secondaryColor = branding.secondaryColor || '#8b5cf6';
  const gradientStyle = getGradientStyle(branding);
  const logoUrl = branding.logoUrl;
  const loginConfig = branding.loginPageConfig || DEFAULT_BRANDING.loginPageConfig!;
  const sliderImages = loginConfig.sliderImages || DEFAULT_SLIDER_IMAGES;
  const features = branding.features || DEFAULT_BRANDING.features!;
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
      transition: { duration: 0.5 },
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
            <motion.img
              src="/logo.svg"
              alt="OneSign"
              className="w-20 h-20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-white/60 text-sm">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} message={t('login.signingIn')} />

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
              imageConfig={branding.cdnConfig ? {
                cdnBaseUrl: branding.cdnConfig.baseUrl,
                defaultQuality: branding.cdnConfig.quality,
                responsiveWidths: branding.cdnConfig.responsiveWidths,
                enableWebP: branding.cdnConfig.enableWebP,
                enableBlurPlaceholder: branding.cdnConfig.enableBlurPlaceholder,
              } : undefined}
            />
          ) : loginConfig.backgroundType === 'image' && loginConfig.backgroundImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${loginConfig.backgroundImageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
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
                  <img
                    src="/logo.svg"
                    alt="OneSign"
                    className="h-16 w-16 object-contain"
                  />
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {branding.welcomeTitle || t('login.welcomeBack')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {branding.welcomeSubtitle || t('login.subtitle')}
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

            {/* Login Form */}
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
                        focusedField === 'email'
                          ? 'text-indigo-500'
                          : fields.email?.error && fields.email?.touched
                            ? 'text-red-500'
                            : fields.email?.isValid && fields.email?.touched
                              ? 'text-green-500'
                              : 'text-slate-400'
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
                    className={`block w-full ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-3.5 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-700 ${
                      focusedField === 'email'
                        ? 'border-transparent ring-2'
                        : fields.email?.error && fields.email?.touched
                          ? 'border-red-500 dark:border-red-500'
                          : fields.email?.isValid && fields.email?.touched
                            ? 'border-green-500 dark:border-green-500'
                            : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={focusedField === 'email' ? { '--tw-ring-color': primaryColor } as any : {}}
                    placeholder={t('login.emailPlaceholder')}
                    value={fields.email?.value || ''}
                    onChange={(e) => updateField('email', e.target.value, validateEmail)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => {
                      setFocusedField(null);
                      touchField('email', validateEmail);
                    }}
                  />
                  <ValidationIcon
                    isValid={fields.email?.isValid || false}
                    show={fields.email?.touched && !fields.email?.isValidating || false}
                    isRTL={isRTL}
                  />
                </div>
                <AnimatePresence>
                  {fields.email?.error && fields.email?.touched && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {fields.email.error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none transition-colors duration-200`}
                  >
                    <svg
                      className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'password'
                          ? 'text-indigo-500'
                          : fields.password?.error && fields.password?.touched
                            ? 'text-red-500'
                            : fields.password?.isValid && fields.password?.touched
                              ? 'text-green-500'
                              : 'text-slate-400'
                      }`}
                      style={focusedField === 'password' ? { color: primaryColor } : {}}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-3.5 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-700 ${
                      focusedField === 'password'
                        ? 'border-transparent ring-2'
                        : fields.password?.error && fields.password?.touched
                          ? 'border-red-500 dark:border-red-500'
                          : fields.password?.isValid && fields.password?.touched
                            ? 'border-green-500 dark:border-green-500'
                            : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={focusedField === 'password' ? { '--tw-ring-color': primaryColor } as any : {}}
                    placeholder={t('login.passwordPlaceholder')}
                    value={fields.password?.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField('password', value, validatePassword);
                      // Update password strength in real-time
                      setPasswordStrength(calculatePasswordStrength(value));
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      setFocusedField(null);
                      touchField('password', validatePassword);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10`}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {fields.password?.error && fields.password?.touched && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {fields.password.error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <PasswordStrengthMeter
                  strength={passwordStrength}
                  show={!!fields.password?.value && fields.password.value.length > 0}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                {features.showRememberMe && (
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                          rememberMe
                            ? 'border-transparent'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                        }`}
                        style={rememberMe ? { backgroundColor: primaryColor } : {}}
                      >
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('login.rememberMe')}</span>
                  </label>
                )}
                <a
                  href={`/${locale}/forgot-password`}
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: primaryColor }}
                >
                  {t('login.forgotPassword')}
                </a>
              </div>

              {/* Trust This Device */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={trustThisDevice}
                      onChange={(e) => setTrustThisDevice(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                        trustThisDevice
                          ? 'border-transparent'
                          : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                      }`}
                      style={trustThisDevice ? { backgroundColor: primaryColor } : {}}
                    >
                      {trustThisDevice && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('login.trustThisDevice')}</span>
                  </div>
                </label>
              </div>

              {/* Sign In Button */}
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
                    <span>{t('login.signIn')}</span>
                    <svg
                      className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    {t('login.orContinueWith')}
                  </span>
                </div>
              </div>

              {/* Magic Link Button */}
              <motion.a
                href={`/${locale}/magic-link${window.location.search}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{t('login.signInWithEmail')}</span>
              </motion.a>

              {/* Social Login */}
              {features.showSocialLogin && (
                <>
                  {/* Google Sign In Button */}
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>{t('login.signInWithGoogle')}</span>
                  </motion.button>

                  {/* Microsoft Sign In Button */}
                  <motion.button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                      <path fill="#f25022" d="M0 0h10.93v10.93H0z" />
                      <path fill="#00a4ef" d="M12.07 0H23v10.93H12.07z" />
                      <path fill="#7fba00" d="M0 12.07h10.93V23H0z" />
                      <path fill="#ffb900" d="M12.07 12.07H23V23H12.07z" />
                    </svg>
                    <span>{t('login.signInWithMicrosoft')}</span>
                  </motion.button>

                  {/* Apple Sign In Button */}
                  <motion.button
                    type="button"
                    onClick={handleAppleLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span>{t('login.signInWithApple')}</span>
                  </motion.button>
                </>
              )}
            </motion.form>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-8 text-center space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex justify-center">
                <DarkModeToggle size="md" />
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {branding.footerText || t('login.securityNote')}
              </p>

              {/* Language Switcher */}
              {features.showLanguageSwitcher && (
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={`/en/login${window.location.search}`}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      locale === 'en'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    English
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <a
                    href={`/fa/login${window.location.search}`}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      locale === 'fa'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    فارسی
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Background - Only shows on small screens */}
        <div
          className="lg:hidden fixed inset-0 -z-10"
          style={{
            background:
              loginConfig.backgroundType === 'gradient'
                ? gradientStyle
                : loginConfig.backgroundType === 'color'
                  ? loginConfig.backgroundColor
                  : `url(${loginConfig.backgroundImageUrl}) center/cover`,
          }}
        >
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" />
        </div>
      </div>
    </>
  );
}
