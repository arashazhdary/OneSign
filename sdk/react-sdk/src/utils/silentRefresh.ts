import { OnesignConfig, TokenInfo } from '../types';

export interface RefreshOptions {
  refreshToken?: string;
  clientSecret?: string;
}

export async function refreshTokenSilently(
  config: OnesignConfig,
  options: RefreshOptions
): Promise<TokenInfo | null> {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const tokenUrl = `${baseUrl}/connect/token`;

  const formData = new URLSearchParams();
  formData.append('grant_type', 'refresh_token');
  formData.append('client_id', config.clientId);

  if (options.refreshToken) {
    formData.append('refresh_token', options.refreshToken);
  }

  if (options.clientSecret) {
    formData.append('client_secret', options.clientSecret);
  }

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in || 3600,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export function scheduleTokenRefresh(
  tokens: TokenInfo,
  onRefresh: () => Promise<TokenInfo | null>,
  onError?: (error: Error) => void
): NodeJS.Timeout | null {
  if (!tokens.expiresIn || tokens.expiresIn <= 0) {
    return null;
  }

  const refreshBuffer = 60;
  const refreshTime = (tokens.expiresIn - refreshBuffer) * 1000;

  if (refreshTime <= 0) {
    return null;
  }

  return setTimeout(async () => {
    try {
      const newTokens = await onRefresh();
      if (!newTokens) {
        onError?.(new Error('Token refresh failed'));
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Token refresh failed'));
    }
  }, refreshTime);
}

export function createIframeSilentRefresh(
  config: OnesignConfig,
  onSuccess: (tokens: TokenInfo) => void,
  onError: (error: Error) => void
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.id = 'onesign-silent-refresh-iframe';

  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    prompt: 'none',
  });

  if (config.tenantId) {
    params.set('tenantId', config.tenantId);
  }

  iframe.src = `${baseUrl}/connect/authorize?${params.toString()}`;

  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== new URL(config.baseUrl).origin) {
      return;
    }

    if (event.data.type === 'onesign_silent_refresh_success') {
      onSuccess(event.data.tokens);
      cleanup();
    } else if (event.data.type === 'onesign_silent_refresh_error') {
      onError(new Error(event.data.error || 'Silent refresh failed'));
      cleanup();
    }
  };

  const cleanup = () => {
    window.removeEventListener('message', messageHandler);
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const timeout = setTimeout(() => {
    onError(new Error('Silent refresh timeout'));
    cleanup();
  }, 10000);

  window.addEventListener('message', messageHandler);

  iframe.onload = () => {
    clearTimeout(timeout);
  };

  document.body.appendChild(iframe);

  return iframe;
}

export async function performSilentRefresh(
  config: OnesignConfig,
  refreshToken?: string
): Promise<TokenInfo | null> {
  if (refreshToken) {
    return refreshTokenSilently(config, { refreshToken });
  }

  return new Promise((resolve) => {
    createIframeSilentRefresh(
      config,
      (tokens) => resolve(tokens),
      () => resolve(null)
    );
  });
}
