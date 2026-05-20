import { useEffect } from 'react';
import { useOnesignAuth } from '@onesign/react-sdk';

const config = {
  baseUrl: import.meta.env.VITE_ONESIGN_BASE_URL ?? 'http://localhost:7000',
  clientId: import.meta.env.VITE_ONESIGN_CLIENT_ID ?? 'spa-sample-client',
  redirectUri: import.meta.env.VITE_ONESIGN_REDIRECT_URI ?? `${window.location.origin}/callback`,
};

export default function App() {
  const { login, logout, handleCallback, isAuthenticated, loading, error, tokenInfo } =
    useOnesignAuth(config);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      void handleCallback(code, params.get('state') ?? undefined);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [handleCallback]);

  if (loading) {
    return <main style={styles.main}>Loading…</main>;
  }

  return (
    <main style={styles.main}>
      <h1>OneSign React SDK Sample</h1>
      <p>Sandbox-friendly SPA using Authorization Code + PKCE.</p>

      {error && <p style={styles.error}>{error}</p>}

      {!isAuthenticated ? (
        <button type="button" onClick={() => login()}>
          Sign in with OneSign
        </button>
      ) : (
        <>
          <p>Signed in. Access token length: {tokenInfo?.accessToken?.length ?? 0}</p>
          <button type="button" onClick={() => logout()}>
            Sign out
          </button>
        </>
      )}

      <pre style={styles.pre}>{JSON.stringify(config, null, 2)}</pre>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '2rem auto', padding: '0 1rem' },
  error: { color: '#b91c1c' },
  pre: { background: '#f1f5f9', padding: '1rem', borderRadius: 8, fontSize: 12 },
};
