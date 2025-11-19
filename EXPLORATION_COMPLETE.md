# OneSign Codebase Exploration - Complete

## Documents Created

I have thoroughly explored the OneSign codebase and created comprehensive documentation for implementing your Automation module:

### 1. ARCHITECTURE_ANALYSIS.md (34 KB)
**The complete technical reference** - Contains everything about the system architecture:
- Module structure and patterns (clean architecture)
- Event bus implementation (Notification Outbox pattern)
- NotificationCenter module deep dive
- Auth/Identity implementation (sessions, MFA, user locking)
- API patterns and controllers
- EF Core patterns and migrations
- MediatR command/query implementation
- Frontend structure (Next.js, React, i18n)
- Test patterns (unit and integration)
- Dependency injection and middleware pipeline
- Complete Automation module implementation template

**Use this for:** Deep understanding of every architectural decision

---

### 2. QUICK_REFERENCE.md (9.5 KB)
**Fast implementation guide** - Quick patterns and templates:
- Module structure checklist
- Critical patterns summary
- File patterns with copy-paste templates
- Multi-tenancy enforcement examples
- Integration points with notifications and audit
- Common pitfalls to avoid
- Testing template

**Use this for:** While implementing, as a quick lookup

---

### 3. KEY_FILES_MAP.md (15 KB)
**File navigation guide** - Exactly where everything is:
- Backend directory structure
- Frontend directory structure
- Critical files organized by purpose
- NotificationCenter as example module
- File templates for new components
- Files to edit when adding a module
- API endpoint patterns
- Database schema organization

**Use this for:** Finding the right file to modify

---

## Key Findings Summary

### Module Structure Pattern
```
Onesign.Modules.[Name]/
├── Application/    (Commands, Queries, Handlers, DTOs, Services, Validators)
├── Domain/         (Entities, Enums, Repositories, Services)
└── Infrastructure/EfCore/ (Configurations, Entities, Repositories)
```

### NO Traditional Event Bus
- Uses **Notification Outbox** pattern instead
- Commands create outbox entries → status = Pending
- BackgroundServices poll and deliver asynchronously
- Retry logic with exponential backoff (max 5 retries)
- Supports Email, SMS, Push channels

### Error Handling Pattern
- Return `Result<T>` instead of throwing exceptions
- Controllers check `result.IsSuccess` before returning
- Validation via FluentValidation (auto-applied)

### Data Access Pattern
- Domain entities separate from EF entities
- Repositories implement Domain interfaces
- Mapping: MapToDomain() and MapToEntity()
- All methods accept `CancellationToken`

### MediatR Pattern
- Commands implement `IRequest<Result<T>>`
- Queries implement `IRequest<Result<T>>`
- Handlers implement `IRequestHandler<TRequest, TResult>`
- Controllers send via `_mediator.Send()`

### Multi-Tenancy
- Every entity has `TenantId`
- Every command includes `TenantId`
- Repositories filter by `TenantId`
- Enforced at data access layer

### Frontend Architecture
- Next.js with App Router
- i18n support (en, fa) via next-intl
- Locale as dynamic segment: `[locale]/`
- API clients in `/lib/api/`
- Translations in `/messages/[locale].json`

---

## For Your Automation Module

### Step 1: Create Structure
```
/src/Onesign.Modules.Automation/
├── Application/ → Commands, Queries, Handlers, DTOs, Services
├── Domain/ → Entities, Enums, Repository Interfaces
└── Infrastructure/EfCore/ → Configurations, Entities, Repositories
```

### Step 2: Implement Core Files
1. Domain entities (`AutomationRule.cs`)
2. Repository interfaces (`IAutomationRuleRepository.cs`)
3. Commands and handlers (`CreateAutomationRuleCommand.cs` + handler)
4. EF entity and configuration
5. Repository implementation

### Step 3: Register in System
1. Add DbSet<T> in `/src/Onesign.Api/Data/OnesignDbContext.cs`
2. Register repositories in `/src/Onesign.Api/Program.cs`
3. Register MediatR assembly in Program.cs
4. Create EF Core migration

### Step 4: Create API Controller
```csharp
[Route("api/tenant/automation")]
public class AutomationController : TenantControllerBase
{
    // Use _mediator.Send() for commands/queries
}
```

### Step 5: Create Frontend UI
```typescript
// app/[locale]/tenant/automation/page.tsx
// Fetch from /api/tenant/automation?tenantId={id}
// Translate with useTranslations()
// Add messages in messages/[locale].json
```

### Step 6: Write Tests
- Unit tests with InMemoryDatabase
- Integration tests with SQL Server container

### Step 7: Integration
- Subscribe to events via NotificationRouter
- Log changes via AppendAuditEventCommand
- Handle multi-tenancy in all operations

---

## Architecture Highlights

### Clean Architecture
- Domain layer has no external dependencies
- Application layer orchestrates business logic
- Infrastructure layer implements data access
- Clear separation of concerns

### CQRS-like Pattern
- Commands for writes (IRequest<Result<T>>)
- Queries for reads (IRequest<Result<T>>)
- All through MediatR
- Validation at application layer

### Repository Pattern
- Swap implementations without changing business logic
- Abstract data access details
- Support for multiple persistence options

### Async/Await Throughout
- All methods async and cancellable
- CancellationToken passed everywhere
- Background services for async work

### Multi-Tenant Safe
- TenantId in every operation
- Repositories enforce tenant isolation
- Middleware extracts tenant from request
- Tests create new context per test

---

## Critical Files You'll Need

**Backend Setup:**
- `/src/Onesign.Api/Program.cs` - Register your module
- `/src/Onesign.Api/Data/OnesignDbContext.cs` - Add your entities
- `/src/Onesign.Shared/Result/Result.cs` - Return result pattern

**Example Module (NotificationCenter):**
- Commands: `/src/Onesign.Modules.NotificationCenter/Application/Commands/`
- Handlers: `/src/Onesign.Modules.NotificationCenter/Application/Handlers/`
- Repositories: `/src/Onesign.Modules.NotificationCenter/Infrastructure/EfCore/Repositories/`
- Configurations: `/src/Onesign.Modules.NotificationCenter/Infrastructure/EfCore/Configurations/`

**Testing:**
- Unit tests example: `/src/Onesign.Api.Tests/Identity/InviteUserToTenantCommandHandlerTests.cs`
- Factory: `/src/Onesign.IntegrationTests/Fixtures/CustomWebApplicationFactory.cs`

**Frontend:**
- Users page example: `/onesign-admin-portal/app/[locale]/tenant/users/page.tsx`
- API client: `/onesign-admin-portal/lib/api/users.ts`
- i18n config: `/onesign-admin-portal/i18n.ts`

---

## Next Steps

1. Read `QUICK_REFERENCE.md` for fast patterns
2. Read `ARCHITECTURE_ANALYSIS.md` Section 14 for step-by-step module implementation
3. Use `KEY_FILES_MAP.md` to find file locations
4. Copy templates from `KEY_FILES_MAP.md` for new files
5. Reference NotificationCenter module as template
6. Follow patterns in existing modules (Identity, Organization)

---

## No Event Bus Found

Important: There is NO traditional publish/subscribe event bus in OneSign. Instead:
- Use **NotificationRouter** to trigger email/SMS/push
- Use **AppendAuditEventCommand** to log changes
- Use **BackgroundServices** for async processing
- Commands/handlers coordinate directly

---

## Multi-Module Coordination

If Automation needs to trigger notifications:
```csharp
await _notificationRouter.RouteEventAsync(
    tenantId: request.TenantId,
    eventType: "automation.triggered",
    context: new Dictionary<string, object> { ... }
);
```

If Automation creates something important:
```csharp
await _mediator.Send(new AppendAuditEventCommand
{
    TenantId = request.TenantId,
    EventType = AuditEventType.AutomationRuleCreated,
    // ...
});
```

---

## Testing Your Module

**Unit Tests:**
```csharp
var options = new DbContextOptionsBuilder<OnesignDbContext>()
    .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
    .Options;
using var context = new OnesignDbContext(options);
// Test your handler
```

**Integration Tests:**
```csharp
var factory = new CustomWebApplicationFactory();
await factory.InitializeAsync();
var client = factory.CreateClient();
// Test full flow
await factory.DisposeAsync();
```

---

## Summary

You now have everything needed to implement the Automation module following exact patterns from:
- 23+ existing modules
- Proven clean architecture
- Multi-tenant safe implementation
- Comprehensive error handling
- Complete test coverage
- Integrated with all system components

Start with QUICK_REFERENCE.md, reference ARCHITECTURE_ANALYSIS.md for details, and use KEY_FILES_MAP.md as navigation.

Good luck with your implementation!
