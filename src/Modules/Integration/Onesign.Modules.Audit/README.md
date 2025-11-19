# Onesign.Modules.Audit

Audit logging module for the onesign SSO platform.

## Overview

This module handles audit logging for all significant events across the platform.

## Domain Entities

- **AuditEvent**: Audit log entry

## Key Features

- Comprehensive audit trail
- Event type categorization
- Metadata storage for additional context
- Multi-tenant audit isolation

## Audit Event Types

- TenantCreated
- TenantStatusChanged
- UserInvited
- UserLoggedIn
- UserDisabled
- ApplicationCreated
- ApplicationDeleted
- And more...

## API Endpoints

- `GET /api/tenant/audit` - Get audit events with filtering

## Usage

```csharp
// Append audit event
var command = new AppendAuditEventCommand
{
    TenantId = tenantId,
    ActorId = userId,
    EventType = AuditEventType.UserLoggedIn,
    Description = "User logged in successfully",
    Metadata = JsonSerializer.Serialize(new { ClientId = clientId })
};
await _mediator.Send(command);

// Query audit events
var query = new GetAuditEventsQuery
{
    TenantId = tenantId,
    StartDate = DateTime.UtcNow.AddDays(-30),
    EndDate = DateTime.UtcNow,
    PageNumber = 1,
    PageSize = 20
};
var events = await _mediator.Send(query);
```

