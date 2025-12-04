# Magic Link (Passwordless Login) Implementation

This document describes the implementation of the Magic Link feature for OneSign's authentication system.

## Overview

The Magic Link feature enables passwordless authentication by sending users a secure, time-limited link via email. Users can click this link to authenticate without entering a password.

## Backend Implementation (.NET)

### 1. Database Layer

#### Domain Entity
**File**: `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Domain/Entities/MagicLinkToken.cs`

Represents a magic link token with the following properties:
- `Id`: Unique identifier
- `TenantUserId`: Reference to the user
- `Token`: Secure random token (URL-safe Base64)
- `ExpiresAt`: Token expiration time (15 minutes from creation)
- `IsUsed`: Flag to prevent token reuse
- `CreatedAt`: Token creation timestamp

#### Infrastructure Entity
**File**: `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Infrastructure/EfCore/Entities/MagicLinkTokenEntity.cs`

EF Core entity matching the domain entity structure.

#### Entity Configuration
**File**: `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Infrastructure/EfCore/Configurations/MagicLinkTokenEntityTypeConfiguration.cs`

Configures the database table with:
- Primary key on `Id`
- Unique index on `Token`
- Required fields validation
- Maximum token length of 500 characters

### 2. Repository Layer

#### Interface
**File**: `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Domain/Repositories/IMagicLinkTokenRepository.cs`

Methods:
- `GetByTokenAsync`: Retrieve token by token string
- `AddAsync`: Store new magic link token
- `UpdateAsync`: Update token (e.g., mark as used)

#### Implementation
**File**: `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Infrastructure/EfCore/Repositories/MagicLinkTokenRepository.cs`

Implements the repository interface with EF Core operations and domain/entity mapping.

### 3. Application Layer (CQRS)

#### Request Magic Link Command
**Files**:
- `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/RequestMagicLinkCommand.cs`
- `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/RequestMagicLinkCommandHandler.cs`

**Process**:
1. Validates user exists and belongs to the tenant
2. Generates secure random token (32 bytes, URL-safe Base64)
3. Creates token record with 15-minute expiration
4. Sends email with magic link (if email service configured)
5. Returns token (only in development mode)

#### Verify Magic Link Command
**Files**:
- `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/VerifyMagicLinkCommand.cs`
- `/home/user/OneSign/src/Modules/Security/Onesign.Modules.Identity/Application/Commands/VerifyMagicLinkCommandHandler.cs`

**Process**:
1. Validates token exists and is not expired/used
2. Marks token as used (one-time use)
3. Generates access and ID tokens
4. Creates login session
5. Updates user's last login timestamp
6. Logs audit event
7. Returns authentication tokens

### 4. API Endpoints

**File**: `/home/user/OneSign/src/Onesign.Api/Controllers/Auth/AuthController.cs`

#### POST /api/auth/magic-link
Request a magic link for passwordless authentication.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Query Parameters**:
- `tenantId` (required): The tenant ID

**Response** (200 OK):
```json
{
  "message": "Magic link has been generated. If email service is configured, check your email.",
  "token": "abc123..." // Only in development or when email service is not configured
}
```

#### GET /api/auth/magic-link/verify
Verify magic link token and authenticate the user.

**Query Parameters**:
- `token` (required): The magic link token
- `clientId` (optional): OAuth client ID for OIDC flow

**Response** (200 OK):
```json
{
  "accessToken": "eyJ...",
  "idToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

## Frontend Implementation (Next.js)

### 1. Magic Link Request Page

**File**: `/home/user/OneSign/onesign-login-portal/app/[locale]/magic-link/page.tsx`

Features:
- Modern split-screen layout matching login page design
- Email input form with validation
- Success state showing confirmation message
- Tenant branding support (colors, logo, background)
- RTL language support
- Responsive design for mobile/desktop

### 2. Magic Link Verification Page

**File**: `/home/user/OneSign/onesign-login-portal/app/[locale]/magic-link/verify/page.tsx`

Features:
- Automatic token verification on page load
- Loading state with branded animation
- Error handling with user-friendly messages
- Support for OAuth/OIDC flows
- Redirect to dashboard or callback URL after successful verification

### 3. Login Page Integration

**File**: `/home/user/OneSign/onesign-login-portal/app/[locale]/login/page.tsx`

Added "Sign in with Email (Magic Link)" button between password login and social login options.

### 4. Translations

**Files**:
- `/home/user/OneSign/onesign-login-portal/messages/en.json`
- `/home/user/OneSign/onesign-login-portal/messages/fa.json`

Added translations for:
- Magic link page title and subtitle
- Button labels
- Success/error messages
- Email verification states
- Expiration notices

## Security Features

1. **Secure Token Generation**: Uses cryptographically secure random number generator (32 bytes)
2. **URL-Safe Encoding**: Base64 encoding with URL-safe character replacements
3. **Time-Limited**: Tokens expire after 15 minutes
4. **One-Time Use**: Tokens are marked as used after successful authentication
5. **Tenant Isolation**: Tokens are tied to specific tenant users
6. **Audit Logging**: All magic link logins are logged for security monitoring

## Email Template

The magic link email includes:
- Clear call-to-action button
- Plain text URL fallback
- Expiration warning (15 minutes)
- Security notice for unauthorized requests

## Usage Flow

1. User clicks "Sign in with Email (Magic Link)" on login page
2. User enters their email address
3. System validates user and sends magic link email
4. User receives email and clicks the link
5. System verifies token and authenticates user
6. User is redirected to dashboard or OAuth callback

## Error Codes

The following error codes are used and should be added to the localization service:

- `USER_NOT_FOUND`: Email not found in system
- `USER_NOT_IN_TENANT`: User is not a member of the specified tenant
- `INVALID_TOKEN`: Token is invalid or not found
- `TOKEN_ALREADY_USED`: Token has already been used
- `TOKEN_EXPIRED`: Token has expired
- `USER_INACTIVE`: User account is not active

## Database Migration

A database migration will be needed to create the `MagicLinkTokens` table with the following schema:

```sql
CREATE TABLE MagicLinkTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    TenantUserId UNIQUEIDENTIFIER NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    CONSTRAINT UQ_MagicLinkTokens_Token UNIQUE (Token)
);

CREATE INDEX IX_MagicLinkTokens_Token ON MagicLinkTokens(Token);
```

## Configuration

### Email Service

The feature requires an email service to be configured. The system will:
- Send emails if `IEmailService` is available
- Return tokens in API response in development mode or when email service is unavailable
- Hide tokens in production when email service is configured (security best practice)

### Frontend Configuration

Set the following environment variable:
- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to `http://localhost:7000`)

## Testing

### Development Testing

When email service is not configured:
1. Request magic link via API
2. Copy token from API response
3. Manually construct verification URL: `/magic-link/verify?token=<token>&tenantId=<tenantId>`
4. Navigate to URL to test verification flow

### Production Testing

1. Configure email service
2. Request magic link through UI
3. Check email inbox
4. Click magic link in email
5. Verify successful authentication

## Future Enhancements

Potential improvements for future iterations:
1. Configurable token expiration time per tenant
2. Rate limiting on magic link requests
3. Magic link request history/tracking
4. Support for custom email templates
5. IP address validation
6. Device fingerprinting
7. Remember device option to reduce magic link requests
8. Email delivery status tracking

## Files Created/Modified

### Backend (.NET)
- ✅ Domain/Entities/MagicLinkToken.cs (new)
- ✅ Infrastructure/EfCore/Entities/MagicLinkTokenEntity.cs (new)
- ✅ Infrastructure/EfCore/Configurations/MagicLinkTokenEntityTypeConfiguration.cs (new)
- ✅ Domain/Repositories/IMagicLinkTokenRepository.cs (new)
- ✅ Infrastructure/EfCore/Repositories/MagicLinkTokenRepository.cs (new)
- ✅ Application/Commands/RequestMagicLinkCommand.cs (new)
- ✅ Application/Commands/RequestMagicLinkCommandHandler.cs (new)
- ✅ Application/Commands/VerifyMagicLinkCommand.cs (new)
- ✅ Application/Commands/VerifyMagicLinkCommandHandler.cs (new)
- ✅ Controllers/Auth/AuthController.cs (modified - added 2 endpoints)

### Frontend (Next.js)
- ✅ app/[locale]/magic-link/page.tsx (new)
- ✅ app/[locale]/magic-link/verify/page.tsx (new)
- ✅ app/[locale]/login/page.tsx (modified - added magic link button)
- ✅ messages/en.json (modified - added translations)
- ✅ messages/fa.json (modified - added translations)

## Next Steps

1. **Database Migration**: Create and run migration to add `MagicLinkTokens` table
2. **Dependency Injection**: Register `IMagicLinkTokenRepository` in DI container
3. **Email Service**: Ensure email service is properly configured
4. **Localization**: Add error code translations to localization service
5. **Testing**: Perform end-to-end testing
6. **Documentation**: Update user documentation
7. **Security Review**: Conduct security audit of the implementation
