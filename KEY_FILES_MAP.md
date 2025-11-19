# OneSign Key Files Map

## Directory Structure Overview

### Backend Backend Structure
```
src/
├── Onesign.Api/                          # Main API project
│   ├── Program.cs                        # DI registration, middleware setup
│   ├── Data/OnesignDbContext.cs          # All entity mappings
│   ├── BackgroundServices/               # Async workers (Notification, Cleanup, etc.)
│   ├── Controllers/                      # API endpoints by category
│   │   ├── Admin/TenantsController.cs
│   │   ├── Tenant/NotificationController.cs
│   │   ├── Auth/AuthController.cs
│   │   └── TenantControllerBase.cs       # Base for tenant-scoped controllers
│   ├── Middleware/                       # Request/response pipeline
│   │   ├── TenantIsolationMiddleware.cs
│   │   ├── JwtAuthenticationMiddleware.cs
│   │   ├── GlobalExceptionHandlerMiddleware.cs
│   │   └── SecurityHeadersMiddleware.cs
│   └── Migrations/                       # EF Core migrations
│
├── Onesign.Modules.[ModuleName]/         # 23+ domain modules
│   ├── Application/
│   │   ├── Commands/                     # Write operations (IRequest<Result<T>>)
│   │   ├── Queries/                      # Read operations (IRequest<Result<T>>)
│   │   ├── Handlers/                     # IRequestHandler implementations
│   │   ├── DTOs/                         # Data transfer objects
│   │   ├── Services/                     # Application services
│   │   └── Validators/                   # FluentValidation rules
│   ├── Domain/
│   │   ├── Entities/                     # Domain models (business logic)
│   │   ├── Enums/                        # Enumeration types
│   │   ├── Repositories/                 # Repository interfaces (IRepository)
│   │   └── Services/                     # Domain service interfaces
│   └── Infrastructure/EfCore/
│       ├── Configurations/               # IEntityTypeConfiguration<T> fluent config
│       ├── Entities/                     # EF entity classes (for mapping)
│       └── Repositories/                 # Repository implementations
│
├── Onesign.Shared/                       # Cross-cutting concerns
│   ├── Result/Result.cs                  # Result<T> pattern
│   ├── Exceptions/                       # Custom exceptions
│   ├── Security/                         # JWT, auth interfaces
│   ├── MultiTenancy/                     # Tenant context
│   ├── Localization/                     # i18n service
│   ├── Email/                            # Email service
│   └── Pagination/                       # Paging utilities
│
├── Onesign.Api.Tests/                    # Unit tests (InMemory DB)
│   ├── Identity/
│   ├── Notifications/
│   ├── Applications/
│   └── [Module]/                         # Mirror of Modules
│
└── Onesign.IntegrationTests/             # Integration tests (SQL Server container)
    ├── Fixtures/CustomWebApplicationFactory.cs
    ├── Controllers/
    ├── E2E/
    ├── Performance/
    └── Security/
```

### Frontend Structure
```
onesign-admin-portal/
├── app/                                  # Next.js App Router
│   ├── [locale]/                         # i18n dynamic segment
│   │   ├── tenant/
│   │   │   ├── users/page.tsx
│   │   │   ├── apps/page.tsx
│   │   │   ├── org-units/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── admin/tenants/page.tsx
│   │   └── layout.tsx
│   └── layout.tsx
│
├── lib/
│   ├── api/users.ts                      # API client functions
│   ├── tenant-context.ts                 # Tenant state management
│   └── tenant-branding.ts
│
├── messages/
│   ├── en.json                           # English translations
│   └── fa.json                           # Persian translations
│
├── i18n.ts                               # i18n configuration
├── middleware.ts                         # Locale middleware
└── package.json
```

---

## Critical Files by Purpose

### 1. Dependency Injection & Setup
- **File**: `/src/Onesign.Api/Program.cs`
- **Contains**: Service registration, MediatR assembly registration, middleware pipeline
- **Must Edit When**: Adding new module, adding new service, changing middleware order
- **Key Lines**: Services.AddScoped<IRepository>, AddMediatR, Add middleware

### 2. Database Context & Mappings
- **File**: `/src/Onesign.Api/Data/OnesignDbContext.cs`
- **Contains**: 100+ DbSet<T> properties, OnModelCreating() with all configurations
- **Must Edit When**: Adding new entity to a module
- **Add**: `public DbSet<YourEntity> YourEntities => Set<YourEntity>();` and `modelBuilder.ApplyConfiguration(...)`

### 3. Module Pattern Example - NotificationCenter
- **Domain Entities**: `/src/Onesign.Modules.NotificationCenter/Domain/Entities/`
  - `NotificationTemplate.cs` - Template model
  - `NotificationOutboxItem.cs` - Pending delivery
  - `NotificationEventSubscription.cs` - Event routing rules
  
- **Domain Repositories**: `/src/Onesign.Modules.NotificationCenter/Domain/Repositories/`
  - `INotificationTemplateRepository.cs`
  - `INotificationOutboxRepository.cs`
  - `INotificationEventSubscriptionRepository.cs`

- **Application Commands**: `/src/Onesign.Modules.NotificationCenter/Application/Commands/`
  - `SendNotificationCommand.cs` - DTO for sending
  - `CreateTemplateCommand.cs` - DTO for template creation

- **Application Handlers**: `/src/Onesign.Modules.NotificationCenter/Application/Handlers/`
  - `SendNotificationCommandHandler.cs` - IRequestHandler implementation
  - `CreateTemplateCommandHandler.cs`
  - `GetTemplatesQueryHandler.cs`

- **Application Services**: `/src/Onesign.Modules.NotificationCenter/Application/Services/`
  - `NotificationRouterService.cs` - Routes events to templates

- **EF Core Configuration**: `/src/Onesign.Modules.NotificationCenter/Infrastructure/EfCore/Configurations/`
  - `NotificationTemplateEntityTypeConfiguration.cs` - Fluent mapping

- **EF Core Repositories**: `/src/Onesign.Modules.NotificationCenter/Infrastructure/EfCore/Repositories/`
  - `NotificationTemplateRepository.cs` - Implementation

### 4. Error Handling Pattern
- **File**: `/src/Onesign.Shared/Result/Result.cs`
- **Contains**: Result base class, Result<T> generic, static factory methods
- **Usage**: All commands/queries return Result<T> instead of throwing

### 5. Shared Infrastructure
- **Localization**: `/src/Onesign.Shared/Localization/ILocalizationService.cs`
- **Email**: `/src/Onesign.Shared/Email/IEmailService.cs`
- **Security**: `/src/Onesign.Shared/Security/IJwtSigningKeyProvider.cs`
- **MultiTenancy**: `/src/Onesign.Shared/MultiTenancy/ITenantContextAccessor.cs`

### 6. Authentication & Identity
- **Domain Entities**: `/src/Onesign.Modules.Identity/Domain/Entities/`
  - `GlobalUser.cs` - Platform user
  - `TenantUser.cs` - Tenant membership
  - `UserLoginSession.cs` - Session tracking
  - `MfaChallenge.cs` - MFA flow

- **Login Handler**: `/src/Onesign.Modules.Identity/Application/Commands/PasswordLoginCommandHandler.cs`
  - Checks password, status, MFA requirement
  - Creates session, audit log, returns tokens

### 7. Background Services (Async Processing)
- **Location**: `/src/Onesign.Api/BackgroundServices/`
- **Key Files**:
  - `NotificationDeliveryWorker.cs` - Polls outbox, delivers via channels
  - `LifecycleProcessorWorker.cs` - Processes identity lifecycle events
  - `SessionCleanupService.cs` - Expires old sessions
  - `KeyRotationWorker.cs` - Rotates crypto keys

### 8. Test Examples
- **Unit Test**: `/src/Onesign.Api.Tests/Identity/InviteUserToTenantCommandHandlerTests.cs`
  - Uses InMemoryDatabase
  - Mocks IMediator for isolation
  - Tests handler with repositories

- **Test Factory**: `/src/Onesign.IntegrationTests/Fixtures/CustomWebApplicationFactory.cs`
  - Uses Testcontainers with SQL Server
  - Configures real database for integration tests

---

## Important File Templates

### New Command File
**Location**: `src/Onesign.Modules.[Module]/Application/Commands/[Name]Command.cs`
```csharp
using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.[Module].Application.Commands;

public class CreateSomethingCommand : IRequest<Result<SomethingDto>>
{
    public Guid TenantId { get; set; }
    // Add properties here
}
```

### New Handler File
**Location**: `src/Onesign.Modules.[Module]/Application/Handlers/[Name]CommandHandler.cs`
```csharp
using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.[Module].Application.Handlers;

public class CreateSomethingCommandHandler : IRequestHandler<CreateSomethingCommand, Result<SomethingDto>>
{
    private readonly IRepository _repository;

    public CreateSomethingCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<SomethingDto>> Handle(CreateSomethingCommand request, CancellationToken cancellationToken)
    {
        // Validate
        // Create entity
        // Save
        // Return DTO
    }
}
```

### New Repository Interface
**Location**: `src/Onesign.Modules.[Module]/Domain/Repositories/IRepository.cs`
```csharp
using Onesign.Modules.[Module].Domain.Entities;

namespace Onesign.Modules.[Module].Domain.Repositories;

public interface IRepository
{
    Task<Something?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Something> AddAsync(Something entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Something entity, CancellationToken cancellationToken = default);
}
```

### New Repository Implementation
**Location**: `src/Onesign.Modules.[Module]/Infrastructure/EfCore/Repositories/Repository.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.[Module].Domain.Entities;
using Onesign.Modules.[Module].Domain.Repositories;
using Onesign.Modules.[Module].Infrastructure.EfCore.Entities;

namespace Onesign.Modules.[Module].Infrastructure.EfCore.Repositories;

public class Repository : IRepository
{
    private readonly DbContext _dbContext;

    public Repository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Something?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.Set<SomethingEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<Something> AddAsync(Something entity, CancellationToken cancellationToken)
    {
        var efEntity = MapToEntity(entity);
        await _dbContext.Set<SomethingEntity>().AddAsync(efEntity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(efEntity);
    }

    private static Something MapToDomain(SomethingEntity entity) => new() { /* map */ };
    private static SomethingEntity MapToEntity(Something domain) => new() { /* map */ };
}
```

### New EF Core Configuration
**Location**: `src/Onesign.Modules.[Module]/Infrastructure/EfCore/Configurations/SomethingEntityTypeConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.[Module].Infrastructure.EfCore.Entities;

namespace Onesign.Modules.[Module].Infrastructure.EfCore.Configurations;

public class SomethingEntityTypeConfiguration : IEntityTypeConfiguration<SomethingEntity>
{
    public void Configure(EntityTypeBuilder<SomethingEntity> builder)
    {
        builder.ToTable("Somethings", schema: "[Module]");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
    }
}
```

### New Frontend Page
**Location**: `onesign-admin-portal/app/[locale]/tenant/something/page.tsx`
```typescript
'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

export default function SomethingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  const fetchData = async () => {
    const response = await fetch(`http://localhost:7000/api/tenant/something?tenantId=${tenantId}`);
    const result = await response.json();
    setData(result.value || []);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1>{t('something.title')}</h1>
      {/* UI here */}
    </div>
  );
}
```

---

## Files to Edit When Adding a Module

1. `/src/Onesign.Api/Program.cs` - Register repositories and services
2. `/src/Onesign.Api/Data/OnesignDbContext.cs` - Add DbSet<T> and configuration
3. Create module-specific test file in `/src/Onesign.Api.Tests/[Module]/`
4. Create frontend page in `/onesign-admin-portal/app/[locale]/tenant/[module]/page.tsx`

---

## API Endpoint Patterns

### Standard REST Endpoints
```
POST   /api/tenant/[module]                              # Create
GET    /api/tenant/[module]?tenantId=X&pageNumber=1     # List
GET    /api/tenant/[module]/{id}?tenantId=X             # Get by ID
PUT    /api/tenant/[module]/{id}?tenantId=X             # Update
DELETE /api/tenant/[module]/{id}?tenantId=X             # Delete
```

### Query Examples
- Get templates: `GET /api/tenant/notifications/templates?tenantId={id}`
- Get users: `GET /api/tenant/users?tenantId={id}&pageNumber=1&pageSize=10`
- Get org units: `GET /api/tenant/org-units/tree?tenantId={id}`

---

## Database Schema Organization

- **Default Schema**: Shared entities (Tenants, some Identity)
- **Module Schemas**: Each module has own schema
  - `NotificationCenter` schema: Notifications tables
  - `Organization` schema: OrgUnit tables
  - `Identity` schema: User, Session tables
  - etc.

---

For comprehensive architecture details, see `/home/user/OneSign/ARCHITECTURE_ANALYSIS.md`
For quick implementation tips, see `/home/user/OneSign/QUICK_REFERENCE.md`
