# @onesign/react-sdk

A minimal but clean React SDK for integrating Onesign SSO into React applications.

## Installation

```bash
npm install @onesign/react-sdk
# or
yarn add @onesign/react-sdk
```

## Configuration

Create an `OnesignConfig` object:

```typescript
import { OnesignConfig } from '@onesign/react-sdk';

const config: OnesignConfig = {
  baseUrl: 'https://your-onesign-instance.com',
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  tenantId: 'optional-tenant-id' // Optional
};
```

## Usage

### Using the Hook

```typescript
import { useOnesignAuth } from '@onesign/react-sdk';

function App() {
  const config: OnesignConfig = {
    baseUrl: 'https://your-onesign-instance.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin + '/callback'
  };

  const { login, logout, handleCallback, tokenInfo, isAuthenticated, loading, error } = useOnesignAuth(config);

  // Handle login
  const handleLogin = () => {
    login();
  };

  // Handle callback after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      handleCallback(code, state || undefined);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Authenticated!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

### Complete Example with Callback Page

**App.tsx:**
```typescript
import { useOnesignAuth } from '@onesign/react-sdk';
import { OnesignConfig } from '@onesign/react-sdk';

function App() {
  const config: OnesignConfig = {
    baseUrl: 'https://your-onesign-instance.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin + '/callback'
  };

  const { login, isAuthenticated, tokenInfo } = useOnesignAuth(config);

  if (isAuthenticated) {
    return (
      <div>
        <h1>Welcome!</h1>
        <p>Access Token: {tokenInfo?.accessToken.substring(0, 20)}...</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={login}>Login with Onesign</button>
    </div>
  );
}
```

**Callback.tsx:**
```typescript
import { useEffect } from 'react';
import { useOnesignAuth } from '@onesign/react-sdk';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const config: OnesignConfig = {
    baseUrl: 'https://your-onesign-instance.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin + '/callback'
  };

  const { handleCallback, loading, error } = useOnesignAuth(config);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      handleCallback(code, state || undefined).then((tokenInfo) => {
        if (tokenInfo) {
          navigate('/');
        }
      });
    }
  }, []);

  if (loading) {
    return <div>Processing authentication...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Redirecting...</div>;
}
```

## API Reference

### `useOnesignAuth(config: OnesignConfig)`

Returns an object with:

- **`login()`**: Initiates the OIDC authorization flow by redirecting to the authorization endpoint
- **`logout()`**: Clears stored tokens and code verifier
- **`handleCallback(code: string, state?: string)`**: Processes the authorization code and exchanges it for tokens
- **`tokenInfo`**: `TokenInfo | null` - Contains access token, ID token, token type, and expiration
- **`isAuthenticated`**: `boolean` - Whether the user is currently authenticated
- **`loading`**: `boolean` - Whether an async operation is in progress
- **`error`**: `string | null` - Error message if any operation failed

### `OnesignConfig`

```typescript
interface OnesignConfig {
  baseUrl: string;        // Onesign instance base URL
  clientId: string;        // Your application client ID
  redirectUri: string;    // Callback URL after authorization
  tenantId?: string;      // Optional tenant ID for multi-tenant scenarios
}
```

### `TokenInfo`

```typescript
interface TokenInfo {
  accessToken: string;    // OAuth 2.0 access token
  idToken: string;        // OpenID Connect ID token (JWT)
  tokenType: string;      // Usually "Bearer"
  expiresIn: number;      // Token expiration time in seconds
}
```

## Token Storage

The SDK stores tokens in `sessionStorage` under the key `onesign_tokens`. The code verifier is stored under `onesign_code_verifier` and is automatically cleaned up after token exchange.

## Security Notes

1. **HTTPS**: Always use HTTPS in production to protect tokens and authorization codes.

2. **State Parameter**: Use the `state` parameter to prevent CSRF attacks. Validate it on callback.

3. **Token Storage**: Tokens are stored in `sessionStorage` which is cleared when the browser session ends. For production, consider implementing more secure storage strategies.

4. **Code Verifier**: The code verifier is automatically managed by the SDK and stored in `sessionStorage`. It's cleared after successful token exchange.

## Multi-Tenant Support

If your application supports multiple tenants, you can specify the `tenantId` in the config. The SDK will automatically include it in the authorization request.

## Error Handling

The SDK provides error information through the `error` property:

```typescript
const { error, handleCallback } = useOnesignAuth(config);

if (error) {
  console.error('Authentication error:', error);
  // Display user-friendly error message
}
```

## License

MIT

