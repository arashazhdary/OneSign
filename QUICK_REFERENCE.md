# OneSign Architecture - Quick Reference

## Key Takeaways for Automation Module

### Module Structure Template
```
Onesign.Modules.Automation/
├── Application/ (Commands, Queries, Handlers, Services, DTOs, Validators)
├── Domain/ (Entities, Enums, Repository Interfaces, Service Interfaces)
└── Infrastructure/EfCore/ (Configurations, Entities, Repositories)
```

### 5-Step Implementation Checklist
1. Create entities in Domain/Entities/
2. Create repository interfaces in Domain/Repositories/
3. Create commands/queries in Application/
4. Implement handlers in Application/Handlers/
5. Implement repositories in Infrastructure/EfCore/Repositories/
6. Register in Program.cs and OnesignDbContext.cs

---

## Critical Patterns

### NO Traditional Event Bus
- Uses **Notification Outbox** pattern
- Commands create outbox entries
- BackgroundServices poll and deliver asynchronously
- Retry logic with exponential backoff (max 5 retries)

### Error Handling
- Return `Result<T>` instead of throwing exceptions
- Controllers check `result.IsSuccess`
- Validation via FluentValidation (auto-applied)

### Data Access
- All repositories accept `CancellationToken cancellationToken = default`
- Domain entities separate from EF entities
- Mapping in repositories: MapToDomain() / MapToEntity()
- Call `await _dbContext.SaveChangesAsync()` in repository

### MediatR Pattern
```csharp
// Commands return Result<T>
public class Command : IRequest<Result<T>> { }

// Queries also return Result<T>
public class Query : IRequest<Result<T>> { }

// Controllers send via _mediator.Send()
var result = await _mediator.Send(command);
```

### Controller Pattern
```csharp
[Route("api/tenant/[controller]")]
public class AutomationController : TenantControllerBase
{
    private readonly IMediator _mediator;
    
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateRuleCommand cmd)
    {
        var result = await _mediator.Send(cmd);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }
}
```

### EF Core Configuration
```csharp
public class EntityTypeConfiguration : IEntityTypeConfiguration<Entity>
{
    public void Configure(EntityTypeBuilder<Entity> builder)
    {
        builder.ToTable("TableName", schema: "ModuleName");
        builder.HasKey(x => x.Id);
        builder.HasIndex(...).IsUnique();
    }
}

// In DbContext:
modelBuilder.ApplyConfiguration(new EntityTypeConfiguration());
```

### Testing
- Use InMemoryDatabase for speed
- Use Testcontainers with SQL Server for integration tests
- Mock IMediator for isolated handler tests
- Each test creates fresh context: `Guid.NewGuid().ToString()`

---

## File Paths Reference

### Backend Key Files
- `/src/Onesign.Api/Program.cs` - DI Registration
- `/src/Onesign.Api/Data/OnesignDbContext.cs` - All entity mappings
- `/src/Onesign.Api/Controllers/` - Controller implementations
- `/src/Onesign.Modules.[ModuleName]/Application/` - Business logic
- `/src/Onesign.Shared/Result/Result.cs` - Error handling pattern

### Frontend Key Files
- `/onesign-admin-portal/app/[locale]/` - Page components
- `/onesign-admin-portal/lib/api/` - API clients
- `/onesign-admin-portal/messages/` - i18n translations
- `/onesign-admin-portal/i18n.ts` - i18n config

### Test Files
- `/src/Onesign.Api.Tests/` - Unit tests (InMemory)
- `/src/Onesign.IntegrationTests/` - Integration tests (SQL Container)
- Each test module mirrors product modules

---

## Important File Patterns

### Command File
```csharp
using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Commands;

public class CreateRuleCommand : IRequest<Result<RuleDto>>
{
    public Guid TenantId { get; set; }
    // ... properties
}
```

### Handler File
```csharp
using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Handlers;

public class CreateRuleCommandHandler : IRequestHandler<CreateRuleCommand, Result<RuleDto>>
{
    private readonly IRepository _repository;
    
    public CreateRuleCommandHandler(IRepository repository)
    {
        _repository = repository;
    }
    
    public async Task<Result<RuleDto>> Handle(CreateRuleCommand request, CancellationToken cancellationToken)
    {
        // Validate, process, persist
        var entity = new Rule { /* ... */ };
        await _repository.AddAsync(entity, cancellationToken);
        return Result.Success(MapToDto(entity));
    }
}
```

### Repository File
```csharp
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Repositories;

public class RuleRepository : IRuleRepository
{
    private readonly DbContext _dbContext;

    public RuleRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Rule?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.Set<RuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<Rule> AddAsync(Rule rule, CancellationToken cancellationToken)
    {
        var entity = MapToEntity(rule);
        await _dbContext.Set<RuleEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }
}
```

---

## Module Dependencies

### Safe Dependencies
- Domain → only other Domain entities
- Application → Domain + Repositories + Services
- Infrastructure → only mapped to Domain
- Controllers → MediatR commands/queries

### UNSAFE (Don't Do)
- Domain → Application
- Domain → Infrastructure
- Module X → Module Y directly (use shared/interfaces)

---

## Multi-Tenancy Enforcement

Every operation must include TenantId:
```csharp
// Command includes TenantId
public class CreateRuleCommand : IRequest<Result<RuleDto>>
{
    public Guid TenantId { get; set; }
}

// Repository filters by TenantId
public async Task<List<Rule>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken)
{
    return await _dbContext.Set<RuleEntity>()
        .Where(x => x.TenantId == tenantId)
        .ToListAsync(cancellationToken);
}

// Controller receives TenantId from header/context
var result = await _mediator.Send(new CreateRuleCommand { TenantId = tenantId, ... });
```

---

## Integration Points

### With Notifications
```csharp
// In your handler or service:
await _notificationRouter.RouteEventAsync(
    tenantId: request.TenantId,
    eventType: "automation.triggered",
    context: new Dictionary<string, object>
    {
        ["RuleId"] = ruleId,
        ["UserId"] = userId,
        ["UserEmail"] = userEmail
    },
    cancellationToken);
```

### With Audit Logging
```csharp
// In your handler:
await _mediator.Send(new AppendAuditEventCommand
{
    TenantId = request.TenantId,
    ActorId = request.ActorId,
    EventType = AuditEventType.AutomationRuleCreated,
    Description = $"Automation rule '{request.Name}' created",
    Metadata = System.Text.Json.JsonSerializer.Serialize(new { RuleId = rule.Id })
}, cancellationToken);
```

---

## Frontend Integration

### API Call Pattern
```typescript
// lib/api/automation.ts
export async function createRule(tenantId: string, rule: CreateRuleRequest) {
    const response = await fetch(
        `http://localhost:7000/api/tenant/automation?tenantId=${tenantId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
        }
    );
    return response.json();
}

// app/[locale]/tenant/automation/page.tsx
const handleCreateRule = async (formData) => {
    const result = await createRule(tenantId, formData);
    if (result.isSuccess) {
        // Success
    } else {
        setError(result.errorMessage);
    }
};
```

---

## Database Migrations

```bash
# When you add new entities:
cd /home/user/OneSign/src/Onesign.Api
dotnet ef migrations add AddAutomationModule
dotnet ef database update

# Check migration status:
dotnet ef migrations list
```

---

## Common Pitfalls to Avoid

1. Forgetting TenantId check in repositories
2. Not using CancellationToken in async methods
3. Missing SaveChangesAsync() in repository
4. Cross-module direct dependencies
5. Not mapping domain entities to DTOs for API
6. Throwing exceptions instead of returning Result.Failure
7. Forgetting to register in Program.cs
8. Not including schema in ToTable() configuration

---

## Testing Template

```csharp
public class CreateRuleCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRule_CreatesSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var repository = new RuleRepository(context);
        var handler = new CreateRuleCommandHandler(repository);

        // Act
        var result = await handler.Handle(
            new CreateRuleCommand
            {
                TenantId = Guid.NewGuid(),
                Name = "Test Rule"
            },
            CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
    }
}
```

---

For complete details, see: `/home/user/OneSign/ARCHITECTURE_ANALYSIS.md`
