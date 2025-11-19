using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.BackgroundServices;
using Onesign.Data.Contexts;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Authorization.Application.Services;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Domain.Services;
using Onesign.Modules.Developer.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Developer.Infrastructure.Services;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;
using Onesign.Modules.Security.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Security.Infrastructure.Services;
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
// Phase 26 - Automation
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;
using Onesign.Modules.Automation.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Automation.Application.Services;
// Phase 24 - Platform
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Platform.Application.Services;
// Phase 25 - Insights
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Application.Jobs;
// Phase 27 - Change Management
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;
using Onesign.Modules.ChangeManagement.Application.Services;
using Onesign.Modules.ChangeManagement.Application.Jobs;
// Phase 28 - Incidents
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Incidents.Application.Services;
// Phase 29 - Hunting
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Hunting.Application.Services;
using Onesign.Modules.Hunting.Application.Jobs;
// Phase 30 - Copilot
using Onesign.Modules.Copilot.Domain.Repositories;
using Onesign.Modules.Copilot.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Copilot.Application.Services;

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
    typeof(Onesign.Modules.Organization.Application.Validators.CreateOrgUnitRequestValidator).Assembly,
    typeof(Onesign.Modules.Security.Application.Commands.UpdateSecurityPolicyCommand).Assembly
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
    typeof(Onesign.Modules.Security.Application.Commands.UpdateSecurityPolicyCommand).Assembly,
    typeof(Onesign.Modules.Authorization.Application.Commands.CreatePolicyCommand).Assembly,
    typeof(Onesign.Modules.Developer.Application.Commands.CreateApiKeyCommand).Assembly,
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
    typeof(Onesign.Modules.AdaptiveSecurity.Application.Commands.CreateAdaptivePolicyCommand).Assembly,
    // Phase 26 - Automation
    typeof(Onesign.Modules.Automation.Application.Commands.CreateWorkflowCommand).Assembly,
    // Phase 24-30 Modules
    typeof(Onesign.Modules.Platform.Application.Commands.ApplyMigrationCommand).Assembly,
    typeof(Onesign.Modules.Insights.Application.Commands.CreateReportSubscriptionCommand).Assembly,
    typeof(Onesign.Modules.ChangeManagement.Application.Commands.CreateChangeSetCommand).Assembly,
    typeof(Onesign.Modules.Incidents.Application.Commands.CreateIncidentCommand).Assembly,
    typeof(Onesign.Modules.Hunting.Application.Commands.CreateSavedQueryCommand).Assembly,
    typeof(Onesign.Modules.Copilot.Application.Commands.SendCopilotQueryCommand).Assembly));

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

// Security Repositories
builder.Services.AddScoped<ISecurityPolicyRepository>(sp =>
    new SecurityPolicyRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IOrgUnitMfaRuleRepository>(sp =>
    new OrgUnitMfaRuleRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IUserMfaMethodRepository>(sp =>
    new UserMfaMethodRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IMfaChallengeRepository>(sp =>
    new MfaChallengeRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<ITrustedDeviceRepository>(sp =>
    new TrustedDeviceRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IRiskEventRepository>(sp =>
    new RiskEventRepository(sp.GetRequiredService<OnesignDbContext>()));

// Security Services
builder.Services.AddScoped<IMfaService, MfaService>();
builder.Services.AddScoped<IMfaChallengeService, MfaChallengeService>();
builder.Services.AddScoped<IDeviceFingerprintService, DeviceFingerprintService>();
builder.Services.AddScoped<IRiskEvaluationService, BasicRiskEvaluationService>();
builder.Services.AddScoped<ISecurityPolicyService, SecurityPolicyService>();
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

// Authorization Repositories
builder.Services.AddScoped<IPolicyDefinitionRepository>(sp =>
    new PolicyDefinitionRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IPolicyAssignmentRepository>(sp =>
    new PolicyAssignmentRepository(sp.GetRequiredService<OnesignDbContext>()));

// Authorization Services
builder.Services.AddScoped<IPolicyEvaluationService, PolicyEvaluationService>();

// Developer Repositories
builder.Services.AddScoped<IApiKeyRepository>(sp =>
    new ApiKeyRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IServiceAccountRepository>(sp =>
    new ServiceAccountRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IApiUsageLogRepository>(sp =>
    new ApiUsageLogRepository(sp.GetRequiredService<OnesignDbContext>()));

// Developer Services
builder.Services.AddScoped<IApiKeyService, ApiKeyService>();

// Automation Repositories
builder.Services.AddScoped<IAutomationWorkflowRepository>(sp =>
    new AutomationWorkflowRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IAutomationExecutionRepository>(sp =>
    new AutomationExecutionRepository(sp.GetRequiredService<OnesignDbContext>()));

// Automation Services
builder.Services.AddScoped<IConditionEvaluator, ConditionEvaluatorService>();
builder.Services.AddScoped<IActionExecutor, ActionExecutorService>();
builder.Services.AddScoped<IAutomationEngine, AutomationEngineService>();
builder.Services.AddScoped<Onesign.Modules.Automation.Application.Services.IAutomationTriggerService, Onesign.Modules.Automation.Application.Services.AutomationTriggerService>();

// HttpClient for automation webhooks
builder.Services.AddHttpClient("AutomationWebhook", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Platform Repositories
builder.Services.AddScoped<IPlatformVersionRepository>(sp =>
    new PlatformVersionRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IMigrationHistoryRepository>(sp =>
    new MigrationHistoryRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IIntegrationTestResultRepository>(sp =>
    new IntegrationTestResultRepository(sp.GetRequiredService<OnesignDbContext>()));

// Platform Services
builder.Services.AddScoped<IPlatformHealthAggregator, PlatformHealthAggregator>();
builder.Services.AddScoped<IPlatformVersionService, PlatformVersionService>();
builder.Services.AddScoped<IMigrationService, MigrationService>();
builder.Services.AddScoped<IApiDocumentationService, ApiDocumentationService>();
builder.Services.AddScoped<IDiagnosticsService, DiagnosticsService>();

// Insights Repositories
builder.Services.AddScoped<ITenantDailyUsageSnapshotRepository>(sp =>
    new TenantDailyUsageSnapshotRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IApplicationDailyUsageSnapshotRepository>(sp =>
    new ApplicationDailyUsageSnapshotRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IUserSecurityPostureRepository>(sp =>
    new UserSecurityPostureRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IReportSubscriptionRepository>(sp =>
    new ReportSubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));

// Insights Services
builder.Services.AddScoped<IInsightsAggregationService, InsightsAggregationService>();
builder.Services.AddScoped<IReportGenerationService, ReportGenerationService>();
builder.Services.AddScoped<IExportService, ExportService>();

// ChangeManagement Repositories
builder.Services.AddScoped<IChangeSetRepository>(sp =>
    new ChangeSetRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IChangeApprovalRuleRepository>(sp =>
    new ChangeApprovalRuleRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IChangeApprovalRepository>(sp =>
    new ChangeApprovalRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IChangeExecutionLogRepository>(sp =>
    new ChangeExecutionLogRepository(sp.GetRequiredService<OnesignDbContext>()));

// ChangeManagement Services
builder.Services.AddScoped<ISimulationEngine, SimulationEngine>();
builder.Services.AddScoped<IChangeSetExecutionService, ChangeSetExecutionService>();
builder.Services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();

// Incidents Repositories
builder.Services.AddScoped<IIncidentRepository>(sp =>
    new IncidentRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IIncidentEventRepository>(sp =>
    new IncidentEventRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IIncidentNoteRepository>(sp =>
    new IncidentNoteRepository(sp.GetRequiredService<OnesignDbContext>()));

// Incidents Services
builder.Services.AddScoped<IIncidentDetectionService, IncidentDetectionService>();
builder.Services.AddScoped<IIncidentCorrelationService, IncidentCorrelationService>();
builder.Services.AddScoped<IIncidentTimelineService, IncidentTimelineService>();
builder.Services.AddScoped<IIncidentPlaybookService, IncidentPlaybookService>();

// Hunting Repositories
builder.Services.AddScoped<ISavedQueryRepository>(sp =>
    new SavedQueryRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IScheduledHuntRepository>(sp =>
    new ScheduledHuntRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IHuntRunRepository>(sp =>
    new HuntRunRepository(sp.GetRequiredService<OnesignDbContext>()));

// Hunting Services
builder.Services.AddScoped<IOqlParser, OqlParser>();
builder.Services.AddScoped<IOqlExecutor, OqlExecutor>();
builder.Services.AddScoped<IScheduledHuntRunner, ScheduledHuntRunner>();
builder.Services.AddScoped<IHuntActionExecutor, HuntActionExecutor>();

// Copilot Repositories
builder.Services.AddScoped<ICopilotConversationRepository>(sp =>
    new CopilotConversationRepository(sp.GetRequiredService<OnesignDbContext>()));

// Copilot Services
builder.Services.AddScoped<ICopilotContextBuilder, CopilotContextBuilder>();
builder.Services.AddScoped<ICopilotOrchestrator, CopilotOrchestrator>();
builder.Services.AddScoped<ICopilotResponseGenerator, CopilotResponseGenerator>();
builder.Services.AddScoped<ICopilotActionExecutor, CopilotActionExecutor>();

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
builder.Services.AddHostedService<AutomationEventProcessor>();
// Phase 24-30 Background Services
builder.Services.AddHostedService<DailyInsightsAggregationJob>();
builder.Services.AddHostedService<ScheduledReportsJob>();
builder.Services.AddHostedService<ScheduledChangeSetApplyJob>();
builder.Services.AddHostedService<ScheduledHuntsRunnerJob>();

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
