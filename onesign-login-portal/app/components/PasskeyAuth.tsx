'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface PasskeyAuthProps {
  tenantId: string;
  email?: string;
  onSuccess: (response: any) => void;
  onError: (error: string) => void;
  mode: 'register' | 'authenticate';
  primaryColor?: string;
}

interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: 'public-key';
}

/**
 * Convert ArrayBuffer to Base64 URL-safe string
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert Base64 URL-safe string to ArrayBuffer
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if WebAuthn is supported in the current browser
 */
function isWebAuthnSupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
 */
async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export default function PasskeyAuth({
  tenantId,
  email,
  onSuccess,
  onError,
  mode,
  primaryColor = '#6366f1',
}: PasskeyAuthProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
  const [platformSupported, setPlatformSupported] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState('');
  const [showDeviceNameInput, setShowDeviceNameInput] = useState(false);

  // Check for WebAuthn support on mount
  useState(() => {
    const checkSupport = async () => {
      const supported = isWebAuthnSupported();
      setPasskeySupported(supported);
      if (supported) {
        const platform = await isPlatformAuthenticatorAvailable();
        setPlatformSupported(platform);
      }
    };
    checkSupport();
  });

  /**
   * Register a new passkey
   */
  const handleRegister = useCallback(async () => {
    if (!email) {
      onError(t('passkey.emailRequired') || 'Email is required for passkey registration');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

      // Step 1: Get registration options from server
      const optionsResponse = await fetch(
        `${baseUrl}/api/auth/passkeys/register/options?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.errorMessage || 'Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Convert base64url strings to ArrayBuffers
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
      };

      // Step 2: Create credential using WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Step 3: Convert credential response to JSON-serializable format
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(attestationResponse.clientDataJSON),
          attestationObject: bufferToBase64url(attestationResponse.attestationObject),
        },
      };

      // Step 4: Send credential to server for verification
      const verifyResponse = await fetch(
        `${baseUrl}/api/auth/passkeys/register/verify?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            deviceName: deviceName || getDefaultDeviceName(),
            attestationResponse: credentialData,
          }),
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.errorMessage || 'Failed to verify registration');
      }

      const result = await verifyResponse.json();
      onSuccess(result);
    } catch (error: any) {
      console.error('Passkey registration error:', error);
      if (error.name === 'NotAllowedError') {
        onError(t('passkey.cancelled') || 'Registration was cancelled');
      } else if (error.name === 'InvalidStateError') {
        onError(t('passkey.alreadyRegistered') || 'A passkey is already registered for this device');
      } else {
        onError(error.message || t('passkey.registrationFailed') || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }, [email, tenantId, deviceName, onSuccess, onError, t]);

  /**
   * Authenticate with existing passkey
   */
  const handleAuthenticate = useCallback(async () => {
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

      // Step 1: Get authentication options from server
      const optionsResponse = await fetch(
        `${baseUrl}/api/auth/passkeys/authenticate/options?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email || null }),
        }
      );

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.errorMessage || 'Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Convert base64url strings to ArrayBuffers
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
      };

      // Step 2: Get credential using WebAuthn API
      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      // Step 3: Convert assertion response to JSON-serializable format
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
          authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
          signature: bufferToBase64url(assertionResponse.signature),
          userHandle: assertionResponse.userHandle
            ? bufferToBase64url(assertionResponse.userHandle)
            : null,
        },
      };

      // Step 4: Send assertion to server for verification
      const verifyResponse = await fetch(
        `${baseUrl}/api/auth/passkeys/authenticate/verify?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assertionResponse: credentialData,
          }),
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.errorMessage || 'Authentication failed');
      }

      const result = await verifyResponse.json();
      onSuccess(result);
    } catch (error: any) {
      console.error('Passkey authentication error:', error);
      if (error.name === 'NotAllowedError') {
        onError(t('passkey.cancelled') || 'Authentication was cancelled');
      } else {
        onError(error.message || t('passkey.authFailed') || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  }, [email, tenantId, onSuccess, onError, t]);

  /**
   * Get a default device name based on the user agent
   */
  function getDefaultDeviceName(): string {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Android/.test(ua)) return 'Android Device';
    if (/Linux/.test(ua)) return 'Linux Device';
    return 'Unknown Device';
  }

  // If WebAuthn is not supported, show a message
  if (passkeySupported === false) {
    return (
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <svg
          className="w-8 h-8 mx-auto mb-2 text-yellow-500"
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
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          {t('passkey.notSupported') || 'Passkeys are not supported in this browser'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mode === 'register' && (
        <AnimatePresence>
          {showDeviceNameInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('passkey.deviceName') || 'Device Name'}
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={getDefaultDeviceName()}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t('passkey.deviceNameHint') || 'Give this passkey a name to identify it later'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeviceNameInput(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <motion.button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 px-4 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t('common.loading') || 'Loading...'}
                    </span>
                  ) : (
                    t('passkey.register') || 'Register Passkey'
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={() => setShowDeviceNameInput(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
              <span>{t('passkey.addPasskey') || 'Add Passkey'}</span>
              {platformSupported && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  {t('passkey.faceIdSupported') || 'Face ID / Touch ID'}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {mode === 'authenticate' && (
        <motion.button
          type="button"
          onClick={handleAuthenticate}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{t('passkey.authenticating') || 'Authenticating...'}</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
              <span>{t('passkey.signInWithPasskey') || 'Sign in with Passkey'}</span>
            </>
          )}
        </motion.button>
      )}

      {/* Info section */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === 'register'
            ? t('passkey.registerInfo') || 'Use Face ID, Touch ID, or your device security to create a passkey'
            : t('passkey.authInfo') || 'Use your registered passkey to sign in securely'}
        </p>
      </div>
    </div>
  );
}
