# Onesign.Modules.Tenants

Tenant management module for the onesign SSO platform.

## Overview

This module handles all tenant-related operations including:
- Tenant creation and management
- Tenant configuration
- Tenant branding (logo, primary color)
- Tenant status management

## Domain Entities

- **Tenant**: Represents a tenant organization
- **TenantConfig**: Configuration and branding for a tenant

## Key Features

- Multi-tenant isolation
- Tenant branding customization
- Tenant status management (Active, Suspended, Inactive)

## API Endpoints

- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant
- `PATCH /api/admin/tenants/{tenantId}/status` - Update tenant status
- `GET /api/tenant/settings` - Get tenant settings
- `PUT /api/tenant/settings/branding` - Update tenant branding

## Usage

```csharp
// Create tenant
var command = new CreateTenantCommand
{
    Name = "My Company",
    Slug = "my-company"
};
var result = await _mediator.Send(command);
```

