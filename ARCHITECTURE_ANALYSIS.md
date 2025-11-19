# OneSign Codebase Architecture Analysis

## Executive Summary
OneSign is a multi-tenant identity and access management platform built with a modular architecture using clean architecture principles. It uses MediatR for command/query patterns, Entity Framework Core for data access, and a Next.js frontend with i18n support.

---

## 1. MODULE STRUCTURE & ORGANIZATION

### Directory Pattern
```
/src/Onesign.Modules.[ModuleName]/
├── Application/           # Business logic & use cases
│   ├── Commands/         # Write operations
│   ├── Handlers/         # MediatR handlers
│   ├── Queries/          # Read operations
│   ├── DTOs/             # Data transfer objects
│   ├── Services/         # Application services
│   └── Validators/       # FluentValidation validators
├── Domain/               # Core business rules
│   ├── Entities/         # Domain models
│   ├── Enums/           # Enumeration types
│   ├── Repositories/     # Repository interfaces
│   └── Services/         # Domain service interfaces
└── Infrastructure/       # Implementation details
    └── EfCore/          # Entity Framework Core
        ├── Configurations/    # EntityTypeConfiguration<T>
        ├── Entities/         # EF entity classes
        └── Repositories/     # Repository implementations
```

### Current Modules (23+ modules)
- Tenants, Identity, Applications, Audit, Organization, Security
- NotificationCenter, AccessRequests, Authorization, Deployment, Crypto
- Developer, Federation, Billing, Observability, IdentityLifecycle
- PrivilegedAccess, IdentityInsights, Extensibility, MultiRegion
- Privacy, AdaptiveSecurity, Governance, AccountCenter, Governance

### Key Pattern: Separation of Concerns
- **Domain Layer**: No dependencies on EF Core, clean entities
- **Application Layer**: Uses MediatR for orchestration, depends on domain
- **Infrastructure Layer**: Implements repositories, depends on EF Core

---

## 2. EVENT BUS & NOTIFICATION PATTERNS

### Implementation Strategy (NOT Traditional Event Bus)
OneSign does NOT use a traditional EventBus or pub/sub pattern. Instead, it uses:

#### A. Notification Outbox Pattern
```csharp
// Entities store notifications for later delivery
public class NotificationOutboxItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public NotificationChannel Channel { get; set; }
    public DeliveryStatus Status { get; set; }  // Pending, Sent, Failed
    public int AttemptCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? NextRetryAt { get; set; }
    public DateTime? SentAt { get; set; }
}
```

#### B. Background Workers for Async Processing
Located in `/src/Onesign.Api/BackgroundServices/`:
```
- NotificationDeliveryWorker    # Polls outbox, delivers via channels
- LifecycleProcessorWorker
- JitExpiryWorker
- RiskScoringWorker
- WebhookDeliveryWorker
- RetentionCleanupWorker
- KeyRotationWorker
- SessionCleanupService
```

#### C. Notification Router Service
```csharp
public interface INotificationRouter
{
    Task RouteEventAsync(
        Guid tenantId, 
        string eventType, 
        Dictionary<string, object> context, 
        CancellationToken cancellationToken = default);
}
```

### Event Types & Subscription Model
```csharp
public class NotificationEventSubscription
{
    public string EventType { get; set; }              // e.g., "user.created", "mfa.enabled"
    public NotificationChannel Channel { get; set; }   // Email, SMS, Push
    public string RecipientSelector { get; set; }      // "user", "manager", custom logic
    public Guid TemplateId { get; set; }
}
```

### Event Integration Points
- Commands trigger notifications via `RouteEventAsync()`
- Templates with placeholders: `Hello {{UserName}}, welcome to {{CompanyName}}`
- Simple variable substitution using `{{{Variable}}}` syntax

---

## 3. NOTIFICATIONCENTER MODULE DEEP DIVE

### Domain Entities
```
NotificationTemplate         # Template definitions
NotificationEventSubscription # Event→Channel→Template mappings
NotificationOutboxItem       # Pending deliveries
NotificationDeliveryLog      # Delivery history
NotificationChannelConfig    # Channel settings (SMTP, SMS, Push)
```

### Channel Support
```csharp
public enum NotificationChannel
{
    Email = 0,
    SMS = 1,
    Push = 2
}

public enum DeliveryStatus
{
    Pending = 0,
    Sent = 1,
    Failed = 2
}
```

### Template System
```csharp
public class NotificationTemplate
{
    public string TemplateKey { get; set; }      // "user.created", "password.reset"
    public string SubjectTemplate { get; set; }   // For Email/InApp
    public string BodyTemplate { get; set; }
    public TemplateCategory Category { get; set; }
    public string Locale { get; set; }            // "en", "fa"
    public bool IsEnabled { get; set; }
}
```

### Delivery Mechanism
1. Command creates outbox entry → status = Pending
2. `NotificationDeliveryWorker` polls every 30 seconds
3. Batches 100 items, processes sequentially
4. Retries with exponential backoff: 2^attempt * 30 seconds (max 5 retries)
5. Updates status to Sent (1) or Failed (2)

### Repositories
```csharp
INotificationTemplateRepository      // CRUD + GetByTenantId
INotificationOutboxRepository        // CRUD + GetPending, retry logic
INotificationEventSubscriptionRepository
```

---

## 4. AUTH/IDENTITY MODULES

### Architecture Overview
- **GlobalUser**: Platform-wide user (email, password hash, verified flag)
- **TenantUser**: Per-tenant user membership (status, admin flag, login tracking)
- **UserLoginSession**: Session management (token, expiry, device fingerprint)

### Session Management Pattern
```csharp
public class UserLoginSession
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string SessionToken { get; set; }      // Cryptographically secure token
    public DateTime ExpiresAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
```

### User Locking Pattern
```csharp
public enum TenantUserStatus
{
    Invited = 0,
    Active = 1,
    Suspended = 2,
    Disabled = 3
}

// Login handler checks: globalUser.PasswordHash && tenantUser.Status == Active
// MFA flow runs before token generation
```

### MFA (Multi-Factor Authentication)
Pattern:
1. `PasswordLoginCommandHandler` checks MFA requirement via `CheckMfaRequirementQuery`
2. If required, creates challenge: `CreateMfaChallengeCommand`
3. Returns temporary ChallengeId to client
4. Client performs MFA verification, then gets full tokens

```csharp
public class MfaChallenge
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string MethodType { get; set; }        // Email, SMS, TOTP
    public string VerificationCode { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int AttemptCount { get; set; }
    public bool IsVerified { get; set; }
}
```

### Trusted Device Pattern
```csharp
public class TrustedDevice
{
    public string DeviceFingerprint { get; set; } // Hash of device characteristics
    public DateTime? TrustedAt { get; set; }
}

// If device is trusted and MFA is required, bypass MFA
```

### Password Reset Flow
```
1. RequestPasswordResetCommand → creates PasswordResetToken (time-limited)
2. User receives reset link with token
3. ConfirmPasswordResetCommand → validates token, updates password
4. Token expires after use or time limit
```

### Authorization Queries
```csharp
public class CheckMfaRequirementQuery : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? OrgUnitId { get; set; }
}

public class CheckTrustedDeviceQuery : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; }
}
```

---

## 5. EXISTING API PATTERNS

### Controller Base Structure
```csharp
// All controllers inherit from TenantControllerBase
[Route("api/tenant/[controller]")]
public class NotificationController : TenantControllerBase
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<ActionResult<Guid>> SendNotification([FromBody] SendNotificationCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }
}
```

### Result Pattern (Custom)
```csharp
public class Result
{
    public bool IsSuccess { get; private set; }
    public bool IsFailure => !IsSuccess;
    public string? ErrorCode { get; private set; }
    public string? ErrorMessage { get; private set; }
}

public class Result<T> : Result
{
    public T? Value { get; private set; }
}

// Usage
return Result.Success(data);
return Result.Failure<T>("ERROR_CODE", "Error message");
```

### Standard API Response Format
```json
{
    "isSuccess": true,
    "value": { /* data */ },
    "errorCode": null,
    "errorMessage": null
}
```

### Routing Conventions
```
/api/global/              # Global (multi-tenant) operations
/api/tenant/              # Tenant-scoped operations (most common)
/api/admin/               # Admin panel operations
```

### Validation Pattern
- Uses **FluentValidation** with auto-validation middleware
- Validators registered by assembly in Program.cs
- Applied to Request DTOs in handlers

```csharp
public class CreateOrgUnitRequestValidator : AbstractValidator<CreateOrgUnitRequest>
{
    public CreateOrgUnitRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(256).WithMessage("Name must not exceed 256 characters");
    }
}
```

---

## 6. EF CORE PATTERNS

### DbContext Structure
```csharp
public class OnesignDbContext : DbContext
{
    // 100+ DbSet<T> properties organized by module
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all configurations
        modelBuilder.ApplyConfiguration(new TenantEntityTypeConfiguration());
        // ... 100+ configurations
    }
}
```

### Entity Type Configuration Pattern
```csharp
public class NotificationTemplateEntityTypeConfiguration 
    : IEntityTypeConfiguration<NotificationTemplateEntity>
{
    public void Configure(EntityTypeBuilder<NotificationTemplateEntity> builder)
    {
        builder.ToTable("NotificationTemplates", schema: "NotificationCenter");
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.TemplateKey).IsRequired().HasMaxLength(200);
        
        builder.HasIndex(x => new { x.TenantId, x.TemplateKey, x.Channel, x.Locale })
            .HasDatabaseName("IX_NotificationTemplates_TenantId_TemplateKey_Channel_Locale")
            .IsUnique();
        
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_NotificationTemplates_TenantId");
    }
}
```

### Entity vs Domain Model Mapping
**Infrastructure Layer Entity** (EF mapped):
```csharp
public class NotificationTemplateEntity
{
    public Guid Id { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    // ... properties
}
```

**Domain Layer Entity** (business logic):
```csharp
public class NotificationTemplate
{
    public Guid Id { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    
    // Can have methods for business logic
    public void Update(...) { /* validation */ }
}
```

**Mapping Pattern** (in Repository):
```csharp
private static NotificationTemplate MapToDomain(NotificationTemplateEntity entity) => new()
{
    Id = entity.Id,
    TemplateKey = entity.TemplateKey,
    // ...
};

private static NotificationTemplateEntity MapToEntity(NotificationTemplate domain) => new()
{
    Id = domain.Id,
    TemplateKey = domain.TemplateKey,
    // ...
};
```

### Repository Base Pattern
```csharp
public class TenantUserRepository : ITenantUserRepository
{
    private readonly DbContext _dbContext;

    public TenantUserRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<TenantUser> AddAsync(TenantUser user, CancellationToken cancellationToken)
    {
        var entity = MapToEntity(user);
        await _dbContext.Set<TenantUserEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }
}
```

### Schema Organization
- Each module has its own schema (e.g., "NotificationCenter", "Organization")
- Shared tables have default schema or explicit schema
- Multi-tenancy enforced at repository level (TenantId filters)

### Migrations
```
/src/Onesign.Api/Migrations/
├── 20251117095030_InitialCreate.cs
├── 20251117144036_AddOrganizationModule.cs
├── 20251117150000_AddSecurityModule.cs
└── OnesignDbContextModelSnapshot.cs
```

---

## 7. MEDIATR COMMAND/QUERY PATTERN

### Command Structure
```csharp
public class SendNotificationCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string RecipientAddress { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
}
```

### Command Handler Structure
```csharp
public class SendNotificationCommandHandler : IRequestHandler<SendNotificationCommand, Result<Guid>>
{
    private readonly INotificationOutboxRepository _outboxRepository;

    public SendNotificationCommandHandler(INotificationOutboxRepository outboxRepository)
    {
        _outboxRepository = outboxRepository;
    }

    public async Task<Result<Guid>> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        // Validation, business logic, persistence
        var outboxItem = new NotificationOutboxItem { /* ... */ };
        await _outboxRepository.AddAsync(outboxItem, cancellationToken);
        return Result.Success(outboxItem.Id);
    }
}
```

### Query Structure
```csharp
public class GetTemplatesQuery : IRequest<Result<List<NotificationTemplateDto>>>
{
    public Guid TenantId { get; set; }
}

public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, Result<List<NotificationTemplateDto>>>
{
    private readonly INotificationTemplateRepository _repository;

    public async Task<Result<List<NotificationTemplateDto>>> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var dtos = templates.Select(MapToDto).ToList();
        return Result.Success(dtos);
    }
}
```

### Registration in Program.cs
```csharp
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    Assembly.GetExecutingAssembly(),
    typeof(Onesign.Modules.NotificationCenter.Application.Commands.SendNotificationCommand).Assembly,
    // ... 20+ module assemblies
));
```

### MediatR Integration in Controllers
```csharp
public class NotificationController : TenantControllerBase
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<ActionResult> SendNotification([FromBody] SendNotificationCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("templates")]
    public async Task<ActionResult> GetTemplates([FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetTemplatesQuery { TenantId = tenantId });
        return Ok(result.Data);
    }
}
```

---

## 8. FRONTEND STRUCTURE (Next.js + React)

### Directory Organization
```
/onesign-admin-portal/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n dynamic segment
│   │   ├── tenant/        # Tenant-scoped pages
│   │   │   ├── users/page.tsx
│   │   │   ├── apps/page.tsx
│   │   │   ├── org-units/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── admin/         # Admin pages
│   │   └── layout.tsx     # Locale layout wrapper
│   └── layout.tsx         # Root layout
├── lib/
│   ├── api/              # API client functions
│   │   └── users.ts
│   ├── tenant-context.ts # Tenant ID context
│   └── tenant-branding.ts
├── messages/             # i18n translations
│   ├── en.json
│   └── fa.json
├── i18n.ts              # i18n configuration
└── middleware.ts        # Locale middleware
```

### Page Component Pattern
```typescript
'use client';

export default function TenantUsersPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch(`http://localhost:7000/api/tenant/users?tenantId=${tenantId}`);
    const data = await response.json();
    setUsers(data.items);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:7000/api/tenant/users/invite?tenantId=${tenantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, isAdmin })
    });
    // Handle response
  };

  return (
    <div className="p-8">
      {/* UI with modals, tables, forms */}
    </div>
  );
}
```

### API Client Pattern
```typescript
// lib/api/users.ts
export interface CurrentUserScopeDto {
  userId: string;
  isGlobalAdmin: boolean;
  rootOrgUnitIds: string[];
  allowedOrgUnitIds: string[];
}

export async function getCurrentUserScope(tenantId: string): Promise<CurrentUserScopeDto | null> {
  try {
    const response = await fetch(`http://localhost:7000/api/tenant/users/current/scope?tenantId=${tenantId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### i18n Pattern
```typescript
// i18n.ts
export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as Locale)) notFound();
  
  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

// In components
const t = useTranslations();
const text = t('tenant.users.title');  // Translates based on locale
```

### i18n Message Files
```json
// messages/en.json
{
  "tenant": {
    "users": {
      "title": "Users",
      "email": "Email",
      "inviteUser": "Invite User",
      "userInvited": "User invited successfully"
    }
  }
}

// messages/fa.json
{
  "tenant": {
    "users": {
      "title": "کاربران",
      "email": "ایمیل",
      "inviteUser": "دعوت کاربر",
      "userInvited": "کاربر با موفقیت دعوت شد"
    }
  }
}
```

### Modal/Form Pattern
```typescript
{showInviteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">{t('tenant.users.inviteUser')}</h2>
      <form onSubmit={handleInviteUser}>
        <div className="mb-4">
          <label>{t('tenant.users.email')}</label>
          <input type="email" required value={inviteEmail} onChange={...} />
        </div>
        <div className="flex gap-2">
          <button type="submit">{t('common.create')}</button>
          <button type="button" onClick={() => setShowInviteModal(false)}>{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  </div>
)}
```

### Tenant Context Pattern
```typescript
// lib/tenant-context.ts
export function getTenantId(): string | null {
  // Gets from sessionStorage or context
}

export function setTenantId(tenantId: string): void {
  // Sets tenant ID in context
}

// Usage in component
const [tenantId, setTenantIdState] = useState<string | null>(null);

useEffect(() => {
  const contextTenantId = getTenantId();
  if (contextTenantId) {
    setTenantIdState(contextTenantId);
  }
}, []);
```

---

## 9. TEST PATTERNS & ORGANIZATION

### Test Project Structure
```
/src/Onesign.Api.Tests/
├── Identity/
│   ├── InviteUserToTenantCommandHandlerTests.cs
│   ├── UserServiceTests.cs
│   └── CompleteFirstLoginCommandHandlerTests.cs
├── Notifications/
│   └── NotificationServiceTests.cs
├── Applications/
├── Audit/
└── ... (more modules)

/src/Onesign.IntegrationTests/
├── Fixtures/
│   ├── CustomWebApplicationFactory.cs
│   └── TestDataGenerator.cs
├── Controllers/
├── E2E/
├── Performance/
└── Security/
```

### Unit Test Pattern (Xunit + Moq)
```csharp
public class InviteUserToTenantCommandHandlerTests
{
    [Fact]
    public async Task Handle_NewUser_CreatesUserAndTenantUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantUserRepository = new TenantUserRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new AuditEventDto()));

        var handler = new InviteUserToTenantCommandHandler(
            globalUserRepository, 
            tenantUserRepository, 
            mediator.Object);

        // Act
        var result = await handler.Handle(
            new InviteUserToTenantCommand { ... }, 
            CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        mediator.Verify(m => m.Send(...), Times.Once);
    }
}
```

### Integration Test Pattern
```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _msSqlContainer = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .WithPassword("YourStrong@Passw0rd!")
        .Build();

    public string ConnectionString => _msSqlContainer.GetConnectionString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<OnesignDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddDbContext<OnesignDbContext>(options =>
                options.UseSqlServer(_msSqlContainer.GetConnectionString()));

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();
            db.Database.Migrate();
        });
    }

    public async Task InitializeAsync() => await _msSqlContainer.StartAsync();
    public new async Task DisposeAsync() => await _msSqlContainer.DisposeAsync();
}
```

### Testing Database Choices
1. **InMemoryDatabase**: Fast, for simple unit tests
2. **SQL Server Container (Testcontainers)**: Integration tests with real DB

### Repository Test Pattern
```csharp
private OnesignDbContext CreateContext()
{
    var options = new DbContextOptionsBuilder<OnesignDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;
    return new OnesignDbContext(options);
}

[Fact]
public async Task GetByIdAsync_ExistingUser_ReturnsUser()
{
    using var context = CreateContext();
    var repository = new TenantUserRepository(context);
    var user = new TenantUser { /* ... */ };
    
    await repository.AddAsync(user, CancellationToken.None);
    var result = await repository.GetByIdAsync(user.Id, CancellationToken.None);
    
    Assert.NotNull(result);
}
```

---

## 10. DEPENDENCY INJECTION PATTERN

### Service Registration (Program.cs)
```csharp
// Repositories (scoped - one per request)
builder.Services.AddScoped<ITenantRepository>(sp => 
    new TenantRepository(sp.GetRequiredService<OnesignDbContext>()));

builder.Services.AddScoped<INotificationRouter, NotificationRouterService>();

// Domain Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService>(sp => 
    new AuthService(
        sp.GetRequiredService<IJwtSigningKeyProvider>(),
        sp.GetRequiredService<IAuthorizationCodeRepository>()));

// Singleton for application-wide state
builder.Services.AddSingleton<IJwtSigningKeyProvider, ConfigurationJwtSigningKeyProvider>();

// Background Services (Hosted Services)
builder.Services.AddHostedService<SessionCleanupService>();
builder.Services.AddHostedService<NotificationDeliveryWorker>();

// DbContext (scoped)
builder.Services.AddDbContext<OnesignDbContext>(options =>
    options.UseSqlServer(connectionString));
```

---

## 11. MIDDLEWARE PIPELINE

```csharp
// Order matters!

// 1. CORS
app.UseCors();
app.UseHttpsRedirection();
app.UseSession();

// 2. Security Headers (must be first)
app.UseMiddleware<SecurityHeadersMiddleware>();

// 3. Global Exception Handler (must be early)
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// 4. Rate Limiting
app.UseMiddleware<RateLimitMiddleware>();

// 5. Localization
app.UseMiddleware<LocalizationMiddleware>();

// 6. Authentication
app.UseMiddleware<JwtAuthenticationMiddleware>();

// 7. Tenant Isolation & Status
app.UseMiddleware<TenantIsolationMiddleware>();
app.UseMiddleware<TenantStatusMiddleware>();
app.UseMiddleware<TenantRateLimitMiddleware>();

// 8. Standard ASP.NET Core
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

---

## 12. SHARED INFRASTRUCTURE

### Located in `/src/Onesign.Shared/`

```
Exceptions/          # BusinessException, custom exceptions
MultiTenancy/        # TenantContextAccessor, ITenantContext
Pagination/          # PagedResult<T>
Result/              # Result pattern
Security/            # IJwtSigningKeyProvider, ICurrentUserService
Services/            # IResourceQuotaService
Localization/        # ILocalizationService
Email/               # IEmailService, SmtpEmailService
```

### MultiTenancy Pattern
```csharp
public interface ITenantContextAccessor
{
    Guid? CurrentTenantId { get; }
    Guid? CurrentUserId { get; }
}

// Extracted from JWT or request headers in TenantIsolationMiddleware
// Available in handlers via dependency injection
```

---

## 13. ARCHITECTURAL PRINCIPLES

### Applied Patterns
1. **Clean Architecture**: Separated layers (Domain, Application, Infrastructure)
2. **CQRS-like**: Commands (write) and Queries (read) through MediatR
3. **Repository Pattern**: Abstract data access, swap implementations
4. **Factory Pattern**: WebApplicationFactory for testing
5. **Middleware Pattern**: Request/response pipeline
6. **Dependency Injection**: Centralized service registration
7. **Validation**: Fluent Validation at application layer
8. **Error Handling**: Result<T> pattern instead of exceptions
9. **Multi-tenancy**: TenantId in all operations, context passed through
10. **Async/Await**: Throughout, with CancellationToken support

### Key Principles
- **Thin Controllers**: Delegate to MediatR handlers
- **DTOs for External APIs**: Domain entities stay internal
- **Separated Entity Models**: Infrastructure entities ≠ Domain entities
- **No Cross-Module Dependencies**: Modules are independent
- **Schema Organization**: One schema per module
- **Audit Everything**: AuditEventCommand in major operations

---

## 14. AUTOMATION MODULE IMPLEMENTATION TEMPLATE

To implement a new Automation module following patterns:

### Step 1: Create Module Structure
```
/src/Onesign.Modules.Automation/
├── Onesign.Modules.Automation.csproj
├── Application/
│   ├── Commands/
│   │   ├── CreateAutomationRuleCommand.cs
│   │   └── CreateAutomationRuleCommandHandler.cs
│   ├── Queries/
│   │   ├── GetAutomationRulesQuery.cs
│   │   └── GetAutomationRulesQueryHandler.cs
│   ├── DTOs/
│   │   └── AutomationRuleDto.cs
│   ├── Handlers/
│   └── Services/
│       └── AutomationEngineService.cs
├── Domain/
│   ├── Entities/
│   │   └── AutomationRule.cs
│   ├── Enums/
│   │   └── AutomationTriggerType.cs
│   ├── Repositories/
│   │   └── IAutomationRuleRepository.cs
│   └── Services/
│       └── IAutomationEngine.cs
└── Infrastructure/
    └── EfCore/
        ├── Configurations/
        │   └── AutomationRuleEntityTypeConfiguration.cs
        ├── Entities/
        │   └── AutomationRuleEntity.cs
        └── Repositories/
            └── AutomationRuleRepository.cs
```

### Step 2: Domain Entity
```csharp
public class AutomationRule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TriggerType { get; set; } = string.Empty;  // "user.created", "mfa.enabled"
    public string Action { get; set; } = string.Empty;        // "send_notification", "assign_group"
    public Dictionary<string, object>? ActionConfig { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

### Step 3: Commands & Handlers
```csharp
public class CreateAutomationRuleCommand : IRequest<Result<AutomationRuleDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TriggerType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public Dictionary<string, object>? ActionConfig { get; set; }
}

public class CreateAutomationRuleCommandHandler : IRequestHandler<CreateAutomationRuleCommand, Result<AutomationRuleDto>>
{
    private readonly IAutomationRuleRepository _repository;

    public async Task<Result<AutomationRuleDto>> Handle(CreateAutomationRuleCommand request, CancellationToken cancellationToken)
    {
        // Validate
        // Create rule
        // Save
        // Return DTO
    }
}
```

### Step 4: Register in DI
```csharp
// Program.cs
builder.Services.AddScoped<IAutomationRuleRepository>(sp =>
    new AutomationRuleRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IAutomationEngine, AutomationEngineService>();

// Add to MediatR registration
typeof(Onesign.Modules.Automation.Application.Commands.CreateAutomationRuleCommand).Assembly
```

### Step 5: Subscribe to Events
In AutomationEngineService:
```csharp
public class AutomationEngineService : IAutomationEngine
{
    private readonly IAutomationRuleRepository _repository;
    private readonly IMediator _mediator;
    private readonly INotificationRouter _notificationRouter;

    public async Task ProcessTriggerAsync(Guid tenantId, string triggerType, Dictionary<string, object> context, CancellationToken cancellationToken)
    {
        var rules = await _repository.GetEnabledByTriggerTypeAsync(tenantId, triggerType, cancellationToken);
        
        foreach (var rule in rules)
        {
            // Execute action based on rule.Action
            switch (rule.Action)
            {
                case "send_notification":
                    await _notificationRouter.RouteEventAsync(tenantId, triggerType, context, cancellationToken);
                    break;
                case "assign_group":
                    await HandleGroupAssignmentAsync(rule, context, cancellationToken);
                    break;
            }
        }
    }
}
```

### Step 6: Hook into Existing Command Handlers
In other modules' command handlers, call automation:
```csharp
// In InviteUserToTenantCommandHandler or similar
var context = new Dictionary<string, object>
{
    ["UserId"] = newUser.Id,
    ["UserEmail"] = newUser.Email,
    ["TenantId"] = request.TenantId
};

await _mediator.Send(new ProcessAutomationTriggersCommand
{
    TenantId = request.TenantId,
    TriggerType = "user.created",
    Context = context
}, cancellationToken);
```

---

## CONCLUSION

OneSign follows **clean architecture principles** with strong module isolation. The key patterns are:

1. **MediatR** for command/query orchestration
2. **Repository Pattern** for data access abstraction
3. **Result<T>** for error handling without exceptions
4. **Notification Outbox** + **Background Workers** instead of traditional event bus
5. **Multi-tenancy** enforced at repository level
6. **EF Core** with fluent configurations and migrations
7. **Next.js Frontend** with i18n and API client pattern
8. **Comprehensive Testing** with unit, integration, and end-to-end tests

For the **Automation module**, follow this structure to fit perfectly with the existing codebase.
