# Onesign.Modules.Identity

Identity and authentication module for the onesign SSO platform.

## Overview

This module handles all identity-related operations including:
- User management (GlobalUser, TenantUser)
- Authentication (Email/Password, Google Social Login)
- Password reset
- OIDC token generation
- Authorization code management

## Domain Entities

- **GlobalUser**: Global user account across all tenants
- **TenantUser**: Tenant-specific user assignment
- **PasswordResetToken**: Password reset tokens
- **UserLoginSession**: User login sessions
- **ExternalLogin**: External login providers (Google, etc.)
- **AuthorizationCode**: OIDC authorization codes

## Key Features

- Multi-tenant user management
- Email/Password authentication
- Google Social Login
- OIDC Authorization Code + PKCE flow
- Password reset functionality
- Session management

## API Endpoints

- `POST /api/auth/login` - Password login
- `POST /api/auth/google-login` - Google social login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Confirm password reset
- `POST /api/auth/complete-first-login` - Complete first login
- `GET /api/tenant/users` - List tenant users
- `POST /api/tenant/users/invite` - Invite user to tenant
- `PATCH /api/tenant/users/{tenantUserId}/status` - Disable user

## Usage

```csharp
// Login
var command = new PasswordLoginCommand
{
    Email = "user@example.com",
    Password = "password123",
    TenantId = tenantId,
    ClientId = clientId
};
var result = await _mediator.Send(command);

// Invite user
var inviteCommand = new InviteUserToTenantCommand
{
    TenantId = tenantId,
    Email = "newuser@example.com",
    IsAdmin = false
};
var inviteResult = await _mediator.Send(inviteCommand);
```

