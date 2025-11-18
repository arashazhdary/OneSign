using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.BackgroundServices;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
// Phase 11 - NotificationCenter
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;
using Onesign.Modules.NotificationCenter.Application.Services;
// Phase 12 - AccessRequests
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Repositories;
using Onesign.Modules.AccessRequests.Application.Services;
// Phase 13 - Platform Hardening & Scale
using Onesign.Shared.MultiTenancy;
using Onesign.Shared.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// FluentValidation
builder.Services.AddValidatorsFromAssemblies(new[]
{
    typeof(Onesign.Modules.Tenants.Application.Validators.CreateTenantRequestValidator).Assembly,
    typeof(Onesign.Modules.Identity.Application.Validators.LoginRequestValidator).Assembly,
    typeof(Onesign.Modules.Applications.Application.Validators.CreateApplicationClientRequestValidator).Assembly,
    typeof(Onesign.Modules.Organization.Application.Validators.CreateOrgUnitRequestValidator).Assembly
});
builder.Services.AddFluentValidationAutoValidation();

// Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=OnesignDb;Trusted_Connection=True;MultipleActiveResultSets=true";

builder.Services.AddDbContext<OnesignDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register DbContext as base type for handlers that need it
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<OnesignDbContext>());

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    Assembly.GetExecutingAssembly(),
    typeof(Onesign.Modules.Tenants.Application.Commands.CreateTenantCommand).Assembly,
    typeof(Onesign.Modules.Identity.Application.Commands.PasswordLoginCommand).Assembly,
    typeof(Onesign.Modules.Applications.Application.Commands.CreateApplicationClientCommand).Assembly,
    typeof(Onesign.Modules.Audit.Application.Commands.AppendAuditEventCommand).Assembly,
    typeof(Onesign.Modules.Organization.Application.Commands.CreateOrgUnitCommand).Assembly,
    // Phase 11-20 Modules
    typeof(Onesign.Modules.NotificationCenter.Application.Commands.SendNotificationCommand).Assembly,
    typeof(Onesign.Modules.AccessRequests.Application.Commands.CreateAccessRequestCommand).Assembly,
    typeof(Onesign.Modules.IdentityLifecycle.Application.Commands.SyncHRDataCommand).Assembly,
    typeof(Onesign.Modules.PrivilegedAccess.Application.Commands.RequestJitAccessCommand).Assembly,
    typeof(Onesign.Modules.IdentityInsights.Application.Queries.GetUserRiskProfileQuery).Assembly,
    typeof(Onesign.Modules.Extensibility.Application.Commands.CreateWebhookCommand).Assembly,
    typeof(Onesign.Modules.MultiRegion.Application.Commands.CreateRegionCommand).Assembly,
    // Phase 21-23 Modules
    typeof(Onesign.Modules.Deployment.Application.Commands.BootstrapEnvironmentCommand).Assembly,
    typeof(Onesign.Modules.Crypto.Application.Commands.RolloverKeyCommand).Assembly,
    typeof(Onesign.Modules.Privacy.Application.Commands.CreateDataSubjectRequestCommand).Assembly,
    // Phase 18 - Adaptive Security
    typeof(Onesign.Modules.AdaptiveSecurity.Application.Commands.CreateAdaptivePolicyCommand).Assembly));

// Repositories
builder.Services.AddScoped<ITenantRepository>(sp => 
    new TenantRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<ITenantConfigRepository>(sp => 
    new TenantConfigRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IGlobalUserRepository>(sp => 
    new GlobalUserRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<ITenantUserRepository>(sp => 
    new TenantUserRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IPasswordResetTokenRepository>(sp => 
    new PasswordResetTokenRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IUserLoginSessionRepository>(sp => 
    new UserLoginSessionRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IExternalLoginRepository>(sp => 
    new ExternalLoginRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>(sp => 
    new Onesign.Modules.Identity.Infrastructure.EfCore.Repositories.AuthorizationCodeRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<IApplicationClientRepository>(sp => 
           new ApplicationClientRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<Onesign.Modules.Applications.Domain.Repositories.IClientSecretRepository>(sp => 
           new Onesign.Modules.Applications.Infrastructure.EfCore.Repositories.ClientSecretRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<IAuditEventRepository>(sp => 
           new AuditEventRepository(sp.GetRequiredService<OnesignDbContext>()));

// Organization Repositories
builder.Services.AddScoped<IOrgUnitRepository>(sp => 
    new OrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IUserOrgUnitRepository>(sp => 
    new UserOrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IApplicationOrgUnitRepository>(sp => 
    new ApplicationOrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IDelegatedAdminRepository>(sp => 
    new DelegatedAdminRepository(sp.GetRequiredService<OnesignDbContext>()));

// Organization Services
builder.Services.AddScoped<IOrgTreeService, OrgTreeService>();
builder.Services.AddScoped<IOrgAuthorizationService, OrgAuthorizationService>();

// NotificationCenter Repositories
builder.Services.AddScoped<INotificationTemplateRepository>(sp =>
    new NotificationTemplateRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<INotificationOutboxRepository>(sp =>
    new NotificationOutboxRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<INotificationEventSubscriptionRepository>(sp =>
    new NotificationEventSubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));

// NotificationCenter Services
builder.Services.AddScoped<INotificationRouter, NotificationRouterService>();

// AccessRequests Repositories
builder.Services.AddScoped<IAccessRequestRepository>(sp =>
    new AccessRequestRepository(sp.GetRequiredService<OnesignDbContext>()));

// AccessRequests Services
builder.Services.AddScoped<IWorkflowEngine, WorkflowEngineService>();

// JWT Signing Key Provider
builder.Services.AddSingleton<Onesign.Shared.Security.IJwtSigningKeyProvider, Onesign.Shared.Security.ConfigurationJwtSigningKeyProvider>();

// Email Service (optional - only if SMTP is configured)
var smtpHost = builder.Configuration["Email:Smtp:Host"];
if (!string.IsNullOrEmpty(smtpHost))
{
    builder.Services.AddScoped<Onesign.Shared.Email.IEmailService, Onesign.Shared.Email.SmtpEmailService>();
}

// Domain Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService>(sp => 
    new AuthService(
        sp.GetRequiredService<Onesign.Shared.Security.IJwtSigningKeyProvider>(),
        sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>()));

// Localization
builder.Services.AddScoped<Onesign.Shared.Localization.ILocalizationService, Onesign.Shared.Localization.LocalizationService>();

// HttpClient for external services
builder.Services.AddHttpClient();

// Phase 13 - Platform Hardening & Scale Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();
builder.Services.AddSingleton<IResourceQuotaService, ResourceQuotaService>();

// Background services
builder.Services.AddHostedService<SessionCleanupService>();
builder.Services.AddHostedService<ClientSecretCleanupService>();
builder.Services.AddHostedService<NotificationDeliveryWorker>();
builder.Services.AddHostedService<LifecycleProcessorWorker>();
builder.Services.AddHostedService<JitExpiryWorker>();
builder.Services.AddHostedService<RiskScoringWorker>();
builder.Services.AddHostedService<WebhookDeliveryWorker>();
builder.Services.AddHostedService<RetentionCleanupWorker>();
builder.Services.AddHostedService<KeyRotationWorker>();
builder.Services.AddHostedService<BackupSchedulerWorker>();
builder.Services.AddHostedService<HealthCheckWorker>();
builder.Services.AddHostedService<AuditCleanupWorker>();
builder.Services.AddHostedService<InsightGenerationWorker>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseSession();

// Security Headers (must be first to ensure all responses have headers)
app.UseMiddleware<Onesign.Api.Middleware.SecurityHeadersMiddleware>();

// Global Exception Handler (must be early in pipeline)
app.UseMiddleware<Onesign.Api.Middleware.GlobalExceptionHandlerMiddleware>();

// Rate Limiting - IP-based (legacy, for basic protection)
app.UseMiddleware<Onesign.Api.Middleware.RateLimitMiddleware>();

// Localization middleware (must be before controllers)
app.UseMiddleware<Onesign.Api.Middleware.LocalizationMiddleware>();

// JWT Authentication Middleware (must be before UseAuthorization)
app.UseMiddleware<Onesign.Api.Middleware.JwtAuthenticationMiddleware>();

// Phase 13 - Tenant Isolation and Status Middleware
// Tenant Isolation - Extract and validate tenant context
app.UseMiddleware<Onesign.Api.Middleware.TenantIsolationMiddleware>();

// Tenant Status - Check tenant status (suspended/maintenance)
app.UseMiddleware<Onesign.Api.Middleware.TenantStatusMiddleware>();

// Per-Tenant Rate Limiting - Apply rate limits based on tenant plan
app.UseMiddleware<Onesign.Api.Middleware.TenantRateLimitMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
