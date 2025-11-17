# Onesign.Modules.Applications

Application client management module for the onesign SSO platform.

## Overview

This module handles all application client-related operations including:
- OAuth/OIDC client application management
- Redirect URI management
- Client secret management

## Domain Entities

- **ApplicationClient**: OAuth/OIDC client application
- **ClientRedirectUri**: Allowed redirect URIs for a client
- **ClientSecret**: Client secrets (for confidential clients)

## Key Features

- Application client CRUD operations
- Redirect URI validation
- Support for Authorization Code + PKCE grant type
- Multi-tenant application isolation

## API Endpoints

- `GET /api/tenant/applications` - List applications
- `POST /api/tenant/applications` - Create application
- `GET /api/tenant/applications/{id}` - Get application details
- `PUT /api/tenant/applications/{id}` - Update application
- `DELETE /api/tenant/applications/{id}` - Delete application
- `POST /api/tenant/applications/{id}/redirect-uris` - Add redirect URI
- `DELETE /api/tenant/applications/redirect-uris/{redirectUriId}` - Remove redirect URI

## Usage

```csharp
// Create application
var command = new CreateApplicationClientCommand
{
    TenantId = tenantId,
    Name = "My Application",
    ApplicationType = ApplicationType.Web,
    GrantType = GrantType.AuthorizationCode,
    RedirectUris = new List<string> { "https://myapp.com/callback" }
};
var result = await _mediator.Send(command);

// Add redirect URI
var addUriCommand = new AddRedirectUriCommand
{
    ApplicationId = applicationId,
    TenantId = tenantId,
    Uri = "https://myapp.com/new-callback"
};
var uriResult = await _mediator.Send(addUriCommand);
```

