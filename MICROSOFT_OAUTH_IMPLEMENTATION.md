# Microsoft OAuth (Azure AD) Implementation

This document describes the Microsoft OAuth implementation for OneSign, following the existing Google OAuth pattern.

## Overview

Microsoft OAuth login has been added to OneSign, allowing users to authenticate using their Microsoft accounts (Azure AD). The implementation follows the same architecture as the existing Google OAuth integration.

## Backend Implementation (.NET)

### 1. Command and Handler Files

Created two new files in `/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/`:

- **MicrosoftLoginCommand.cs**: Defines the command structure for Microsoft login
  - `TenantId`: The tenant ID
  - `IdToken`: The Microsoft ID token
  - `ClientId`: Optional client ID for OIDC flow

- **MicrosoftLoginCommandHandler.cs**: Handles the Microsoft login logic
  - Validates Microsoft ID token by decoding JWT and verifying claims
  - Verifies audience (aud) matches configured client ID
  - Verifies issuer (iss) is from Microsoft (login.microsoftonline.com or sts.windows.net)
  - Checks token expiration
  - Creates or updates GlobalUser, ExternalLogin, and TenantUser entities
  - Generates OneSign access and ID tokens
  - Creates login session

### 2. API Endpoint

Added to `/src/Onesign.Api/Controllers/Auth/AuthController.cs`:

- **POST /api/auth/microsoft-login**: New endpoint for Microsoft authentication
  - Accepts `MicrosoftLoginRequest` with IdToken and optional ClientId
  - Returns `LoginResponse` with access token and ID token
  - Supports OIDC authorization flow

### 3. Configuration

Updated `/src/Onesign.Api/appsettings.json`:

```json
{
  "Microsoft": {
    "ClientId": "YOUR_MICROSOFT_CLIENT_ID_HERE"
  }
}
```

**Important**: Replace `YOUR_MICROSOFT_CLIENT_ID_HERE` with your actual Microsoft Azure AD Application Client ID.

## Frontend Implementation (Next.js)

### 1. Login Page Updates

Modified `/onesign-login-portal/app/[locale]/login/page.tsx`:

- Added `window.msal` type declaration for MSAL.js library
- Implemented `handleMicrosoftLogin()` function:
  - Dynamically loads MSAL.js library (v2.38.1)
  - Configures MSAL with client ID and authority
  - Uses popup flow for authentication
  - Sends ID token to backend `/api/auth/microsoft-login` endpoint
  - Handles OIDC flow if applicable
  - Includes error handling for user cancellation
- Added Microsoft sign-in button with official Microsoft logo (4-color Windows logo)

### 2. Translation Files

Updated translation files in `/onesign-login-portal/messages/`:

**en.json**:
```json
{
  "login": {
    "signInWithMicrosoft": "Sign in with Microsoft"
  }
}
```

**fa.json**:
```json
{
  "login": {
    "signInWithMicrosoft": "ورود با مایکروسافت"
  }
}
```

## Configuration Setup

### Backend Configuration

1. **Azure AD Application Setup**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory > App registrations
   - Create a new app registration or use existing one
   - Copy the Application (client) ID
   - Add redirect URIs for your application
   - Configure API permissions: `openid`, `profile`, `email`, `User.Read`

2. **Update appsettings.json**:
   ```json
   {
     "Microsoft": {
       "ClientId": "your-azure-ad-client-id"
     }
   }
   ```

3. **Tenant-Specific Configuration** (Optional):
   - For multi-tenant support, the implementation uses `/common` endpoint
   - For single-tenant, change authority to: `https://login.microsoftonline.com/{tenant-id}`

### Frontend Configuration

1. **Environment Variables**:
   Create or update `.env.local` in `/onesign-login-portal/`:
   ```env
   NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-azure-ad-client-id
   NEXT_PUBLIC_API_URL=http://localhost:7000
   ```

2. **Redirect URI Configuration**:
   - The redirect URI is automatically set to: `{origin}/{locale}/login`
   - Example: `http://localhost:3000/en/login`
   - Make sure this URI is registered in Azure AD

## Security Features

- **Token Validation**: ID token is validated on the backend by:
  - Checking JWT structure (3 parts)
  - Verifying audience matches configured client ID
  - Verifying issuer is from Microsoft domains
  - Checking token expiration

- **Session Management**: Creates secure login sessions with:
  - Random session tokens
  - 24-hour expiration
  - IP address and user agent tracking support

- **User Management**: Follows the same pattern as Google OAuth:
  - Auto-creates users on first login
  - Links Microsoft account to global user
  - Auto-activates tenant user for social login
  - Verifies email automatically (Microsoft handles email verification)

## Authentication Flow

1. User clicks "Sign in with Microsoft" button
2. MSAL.js library loads and initializes
3. Popup window opens for Microsoft authentication
4. User authenticates with Microsoft credentials
5. Microsoft returns ID token to frontend
6. Frontend sends ID token to backend `/api/auth/microsoft-login`
7. Backend validates token and creates/updates user
8. Backend generates OneSign access and ID tokens
9. Frontend redirects to dashboard or OIDC callback

## Integration with Existing Features

- **OIDC Flow**: Fully supports OpenID Connect authorization flow
- **Multi-Factor Authentication**: Can be configured in Azure AD
- **Tenant Isolation**: Respects OneSign's multi-tenant architecture
- **Localization**: Supports all languages configured in OneSign
- **Branding**: Button styling follows tenant branding configuration

## Testing

1. **Backend Testing**:
   - Set Microsoft ClientId in appsettings.json
   - Test endpoint with valid Microsoft ID token
   - Verify user creation and token generation

2. **Frontend Testing**:
   - Set environment variable `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
   - Click Microsoft sign-in button
   - Authenticate with Microsoft account
   - Verify redirect to dashboard

## Dependencies

### Backend
- No additional NuGet packages required (uses built-in JWT libraries)

### Frontend
- **MSAL.js v2.38.1**: Loaded dynamically via CDN
  - URL: `https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js`
  - No npm package installation required

## Troubleshooting

### Common Issues

1. **"Microsoft authentication is not configured"**
   - Solution: Set Microsoft:ClientId in appsettings.json

2. **"Invalid Microsoft ID Token or audience mismatch"**
   - Solution: Verify client ID matches Azure AD application

3. **"Invalid Microsoft token issuer"**
   - Solution: Token must be from login.microsoftonline.com or sts.windows.net

4. **Popup blocked**
   - Solution: User must allow popups for the login page
   - Alternative: Implement redirect flow instead of popup flow

5. **CORS errors**
   - Solution: Ensure redirect URI is properly configured in Azure AD

## Future Enhancements

- Support for redirect flow (as alternative to popup)
- Support for B2C tenants
- Support for personal Microsoft accounts (consumer)
- Integration with Microsoft Graph API
- Silent token refresh

## Files Modified

### Backend
- `/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/MicrosoftLoginCommand.cs` (new)
- `/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/MicrosoftLoginCommandHandler.cs` (new)
- `/src/Onesign.Api/Controllers/Auth/AuthController.cs` (modified)
- `/src/Onesign.Api/appsettings.json` (modified)

### Frontend
- `/onesign-login-portal/app/[locale]/login/page.tsx` (modified)
- `/onesign-login-portal/messages/en.json` (modified)
- `/onesign-login-portal/messages/fa.json` (modified)

## Summary

Microsoft OAuth has been successfully integrated into OneSign, providing users with an additional secure authentication method. The implementation follows the existing Google OAuth pattern, ensuring consistency and maintainability. Both backend and frontend components work together seamlessly to provide a smooth authentication experience.
