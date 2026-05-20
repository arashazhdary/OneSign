using Fido2NetLib;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Authentication;
using Onesign.Api.BackgroundServices;
using Onesign.Api.Configuration;
using Onesign.Api.Extensions;
using Onesign.Api.Services;
using Onesign.Data.Contexts;
using Onesign.Modules.AccessRequests.Application.Services;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Repositories;
using Onesign.Modules.AccessRequests.Infrastructure.Services;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
// ماژول‌های یکپارچه‌سازی
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Authorization.Application.Services;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Automation.Application.Services;
// ماژول‌های عملیاتی
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;
using Onesign.Modules.Automation.Infrastructure.EfCore.Repositories;
using Onesign.Modules.ChangeManagement.Application.Jobs;
using Onesign.Modules.ChangeManagement.Application.Services;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Copilot.Application.Services;
using Onesign.Modules.Copilot.Domain.Repositories;
using Onesign.Modules.Copilot.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Domain.Services;
using Onesign.Modules.Developer.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Developer.Infrastructure.Services;
// ماژول‌های Governance
using Onesign.Modules.Governance.Domain.Repositories;
using Onesign.Modules.Governance.Infrastructure.EfCore.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Repositories;
using Onesign.Modules.IdentityLifecycle.Infrastructure.Services;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;
using Onesign.Modules.IdentityInsights.Infrastructure.Services;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;
// ماژول‌های Security اضافی
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Repositories;
using Onesign.Modules.PrivilegedAccess.Domain.Services;
using Onesign.Modules.PrivilegedAccess.Infrastructure.Services;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.Services;
// ماژول‌های Platform اضافی
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Repositories;
using Onesign.Modules.MultiRegion.Infrastructure.Services;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Crypto.Infrastructure.Services;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Deployment.Infrastructure.Services;
// ماژول‌های Business اضافی
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Repositories;
// ماژول‌های Integration اضافی
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Privacy.Domain.Services;
using Onesign.Modules.Privacy.Infrastructure.Services;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Domain.Services;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Extensibility.Infrastructure.Services;
using Onesign.Modules.Hunting.Application.Jobs;
using Onesign.Modules.Hunting.Application.Services;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Repositories;
// ماژول‌های امنیتی
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Modules.Incidents.Application.Services;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Insights.Application.Jobs;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;
using Onesign.Modules.NotificationCenter.Application.Services;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;
// ماژول‌های کسب و کار
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Onesign.Modules.Platform.Application.Services;
// ماژول‌های پلتفرم
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;
using Onesign.Modules.Security.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Onesign.Shared.MultiTenancy;
using Onesign.Shared.Services;
using System.Reflection;
using Onesign.Api.Middleware;

// =====================================================
// نقطه ورود اصلی برنامه
// این فایل شامل پیکربندی و راه‌اندازی تمام سرویس‌های سیستم است
// =====================================================

var builder = WebApplication.CreateBuilder(args);

// پیکربندی سرویس‌ها به ترتیب اهمیت
ConfigureSharedServices(builder);
ConfigureSecurityServices(builder);
ConfigureGovernanceServices(builder);
ConfigureOperationsServices(builder);
ConfigurePlatformServices(builder);
ConfigureBusinessServices(builder);
ConfigureIntegrationServices(builder);
ConfigureBackgroundServices(builder);

// سرویس‌های ماژول Access Requests
builder.Services.AddScoped<IAccessRequestWorkflowEngine, AccessRequestWorkflowEngineService>();
builder.Services.AddScoped<IAccessRequestProvisioningService, AccessRequestProvisioningService>();
builder.Services.AddScoped<IAccessApprovalService, AccessApprovalService>();
builder.Services.AddScoped<IWorkflowEngine, WorkflowEngineService>();

var app = builder.Build();

// Seed database with test data in development
//if (app.Environment.IsDevelopment())
//{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await Onesign.Api.Data.DatabaseSeeder.SeedAsync(dbContext, logger);
//}

// پیکربندی میدلورها و پایپلاین درخواست
ConfigureMiddleware(app);

app.Run();

// =====================================================
// متدهای پیکربندی سرویس‌ها
// =====================================================

// سرویس‌های مشترک و زیرساختی
/// شامل پایگاه داده، اعتبارسنجی، مدیاتور و سایر سرویس‌های پایه
/// </summary>
static void ConfigureSharedServices(WebApplicationBuilder builder)
{
    // =====================================================
    // کنترلرها و مستندات API
    // =====================================================
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // =====================================================
    // اعتبارسنجی با FluentValidation
    // سیستم اعتبارسنجی خودکار درخواست‌ها
    // =====================================================
    builder.Services.AddValidatorsFromAssemblies(new[]
    {
        typeof(Onesign.Modules.Tenants.Application.Validators.CreateTenantRequestValidator).Assembly,
        typeof(Onesign.Modules.Identity.Application.Validators.LoginRequestValidator).Assembly,
        typeof(Onesign.Modules.Applications.Application.Validators.CreateApplicationClientRequestValidator).Assembly,
        typeof(Onesign.Modules.Organization.Application.Validators.CreateOrgUnitRequestValidator).Assembly,
        typeof(Onesign.Modules.Security.Application.Commands.UpdateSecurityPolicyCommand).Assembly
    });
    builder.Services.AddFluentValidationAutoValidation();

    // =====================================================
    // مدیریت نشست کاربر و کش
    // ذخیره‌سازی موقت اطلاعات نشست و داده‌ها در حافظه
    // =====================================================
    builder.Services.AddMemoryCache();
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddSession(options =>
    {
        options.IdleTimeout = TimeSpan.FromMinutes(30);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
    });

    // =====================================================
    // تنظیمات CORS
    // مدیریت درخواست‌های Cross-Origin برای فرانت‌اند
    // =====================================================
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:3001", "https://localhost:3001" };

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // =====================================================
    // احراز هویت و مجوزدهی
    // در محیط توسعه، همه درخواست‌ها مجاز هستند
    // =====================================================
    builder.Services.AddAuthentication("Development")
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DevelopmentAuthHandler>(
            "Development", options => { });
    builder.Services.AddAuthorization();

    // =====================================================
    // پایگاه داده
    // اتصال به SQL Server با Entity Framework Core
    // =====================================================
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=OnesignDb;Trusted_Connection=True;MultipleActiveResultSets=true";

    builder.Services.AddDbContext<OnesignDbContext>(options =>
        options.UseSqlServer(connectionString,
            b => b.MigrationsAssembly("Onesign.Api")));

    // ثبت DbContext برای هندلرهایی که به نوع پایه نیاز دارند
    builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<OnesignDbContext>());

    // =====================================================
    // MediatR - الگوی CQRS
    // مدیریت دستورات و کوئری‌ها در تمام ماژول‌ها
    // =====================================================
    builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
        Assembly.GetExecutingAssembly(),
        // ماژول‌های اصلی
        typeof(Onesign.Modules.Tenants.Application.Commands.CreateTenantCommand).Assembly,
        typeof(Onesign.Modules.Identity.Application.Commands.PasswordLoginCommand).Assembly,
        typeof(Onesign.Modules.Applications.Application.Commands.CreateApplicationClientCommand).Assembly,
        typeof(Onesign.Modules.Audit.Application.Commands.AppendAuditEventCommand).Assembly,
        typeof(Onesign.Modules.Organization.Application.Commands.CreateOrgUnitCommand).Assembly,
        typeof(Onesign.Modules.Security.Application.Commands.UpdateSecurityPolicyCommand).Assembly,
        typeof(Onesign.Modules.Authorization.Application.Commands.CreatePolicyCommand).Assembly,
        typeof(Onesign.Modules.Developer.Application.Commands.CreateApiKeyCommand).Assembly,
        // ماژول‌های فاز ۱۱-۲۰
        typeof(Onesign.Modules.NotificationCenter.Application.Commands.SendNotificationCommand).Assembly,
        typeof(Onesign.Modules.AccessRequests.Application.Commands.CreateAccessRequestCommand).Assembly,
        typeof(Onesign.Modules.IdentityLifecycle.Application.Commands.SyncHRDataCommand).Assembly,
        typeof(Onesign.Modules.PrivilegedAccess.Application.Commands.RequestJitAccessCommand).Assembly,
        typeof(Onesign.Modules.IdentityInsights.Application.Queries.GetUserRiskProfileQuery).Assembly,
        typeof(Onesign.Modules.Extensibility.Application.Commands.CreateWebhookCommand).Assembly,
        typeof(Onesign.Modules.MultiRegion.Application.Commands.CreateRegionCommand).Assembly,
        // ماژول‌های فاز ۲۱-۲۳
        typeof(Onesign.Modules.Deployment.Application.Commands.BootstrapEnvironmentCommand).Assembly,
        typeof(Onesign.Modules.Crypto.Application.Commands.RolloverKeyCommand).Assembly,
        typeof(Onesign.Modules.Privacy.Application.Commands.CreateDataSubjectRequestCommand).Assembly,
        // ماژول امنیت تطبیقی
        typeof(Onesign.Modules.AdaptiveSecurity.Application.Commands.CreateAdaptivePolicyCommand).Assembly,
        // ماژول اتوماسیون
        typeof(Onesign.Modules.Automation.Application.Commands.CreateWorkflowCommand).Assembly,
        // ماژول‌های فاز ۲۴-۳۰
        typeof(Onesign.Modules.Platform.Application.Commands.ApplyMigrationCommand).Assembly,
        typeof(Onesign.Modules.Insights.Application.Commands.CreateReportSubscriptionCommand).Assembly,
        typeof(Onesign.Modules.ChangeManagement.Application.Commands.CreateChangeSetCommand).Assembly,
        typeof(Onesign.Modules.Incidents.Application.Commands.CreateIncidentCommand).Assembly,
        typeof(Onesign.Modules.Hunting.Application.Commands.CreateSavedQueryCommand).Assembly,
        typeof(Onesign.Modules.Copilot.Application.Commands.SendCopilotQueryCommand).Assembly));

    // =====================================================
    // سرویس‌های امضای JWT
    // مدیریت کلیدهای امضای توکن‌های JWT
    // =====================================================
    builder.Services.AddSingleton<Onesign.Shared.Security.IJwtSigningKeyProvider, Onesign.Shared.Security.ConfigurationJwtSigningKeyProvider>();

    // =====================================================
    // سرویس ایمیل (SMTP / SendGrid / Null)
    // =====================================================
    builder.Services.AddOnesignEmailServices(builder.Configuration);

    // =====================================================
    // سرویس SMS (Twilio / Logging dev / Null)
    // =====================================================
    builder.Services.AddOnesignSmsServices(builder.Configuration, builder.Environment);

    // =====================================================
    // سرویس محلی‌سازی
    // پشتیبانی از چند زبانه
    // =====================================================
    builder.Services.AddScoped<Onesign.Shared.Localization.ILocalizationService, Onesign.Shared.Localization.LocalizationService>();

    // =====================================================
    // HttpClient برای سرویس‌های خارجی
    // =====================================================
    builder.Services.AddHttpClient();
    builder.Services.AddHttpClient("RecaptchaClient", client =>
    {
        client.Timeout = TimeSpan.FromSeconds(10);
    });

    // =====================================================
    // سرویس‌های پلتفرم - سخت‌سازی و مقیاس‌پذیری
    // =====================================================
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();
    builder.Services.AddSingleton<IResourceQuotaService, ResourceQuotaService>();

    // =====================================================
    // سرویس‌های محدودیت نرخ و قفل ورود
    // مدیریت تلاش‌های ناموفق ورود و قفل کردن IP
    // =====================================================
    var rateLimitOptions = builder.Configuration.GetSection(RateLimitOptions.SectionName).Get<RateLimitOptions>() ?? new RateLimitOptions();
    var loginLockoutOptions = new LoginLockoutOptions
    {
        MaxFailedAttempts = rateLimitOptions.Lockout.MaxFailedAttempts,
        TrackingWindowMinutes = rateLimitOptions.Lockout.TrackingWindowMinutes,
        LockoutDurationMinutes = rateLimitOptions.Lockout.LockoutDurationMinutes
    };
    builder.Services.AddSingleton(loginLockoutOptions);
    builder.Services.AddSingleton<ILoginAttemptTracker, LoginAttemptTracker>();
}

// سرویس‌های امنیتی
// مدیریت هویت، احراز هویت، مجوزدهی، درخواست دسترسی و دسترسی ویژه
/// </summary>
static void ConfigureSecurityServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول هویت
    // مدیریت کاربران و نشست‌های ورود
    // =====================================================
    builder.Services.AddScoped<Onesign.Modules.Identity.Domain.Repositories.IGlobalUserRepository>(sp =>
        new GlobalUserRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<Onesign.Modules.Identity.Domain.Repositories.ITenantUserRepository>(sp =>
        new TenantUserRepository(sp.GetRequiredService<OnesignDbContext>()));

    // Adapters for Security module
    builder.Services.AddScoped<Onesign.Modules.Security.Domain.Repositories.IGlobalUserRepository>(sp =>
        new Onesign.Api.Adapters.GlobalUserRepositoryAdapter(
            sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.IGlobalUserRepository>()));
    builder.Services.AddScoped<Onesign.Modules.Security.Domain.Repositories.ITenantUserRepository>(sp =>
        new Onesign.Api.Adapters.TenantUserRepositoryAdapter(
            sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.ITenantUserRepository>()));

    builder.Services.AddScoped<IPasswordResetTokenRepository>(sp =>
        new PasswordResetTokenRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IMagicLinkTokenRepository>(sp =>
        new MagicLinkTokenRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IPasskeyCredentialRepository>(sp =>
        new PasskeyCredentialRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUserLoginSessionRepository>(sp =>
        new UserLoginSessionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IExternalLoginRepository>(sp =>
        new ExternalLoginRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>(sp =>
        new Onesign.Modules.Identity.Infrastructure.EfCore.Repositories.AuthorizationCodeRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول هویت
    // رمزنگاری پسورد و احراز هویت
    // =====================================================
    builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
    builder.Services.AddScoped<IAuthService>(sp =>
        new AuthService(
            sp.GetRequiredService<Onesign.Shared.Security.IJwtSigningKeyProvider>(),
            sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>()));
    builder.Services.AddScoped<IRecaptchaService, RecaptchaService>();

    // FIDO2/WebAuthn configuration for Passkeys
    builder.Services.AddScoped<IFido2>(sp =>
    {
        var config = new Fido2Configuration
        {
            ServerDomain = builder.Configuration["Fido2:ServerDomain"] ?? "localhost",
            ServerName = builder.Configuration["Fido2:ServerName"] ?? "OneSign",
            Origins = builder.Configuration.GetSection("Fido2:Origins").Get<HashSet<string>>()
                ?? new HashSet<string> { "https://localhost:5001" },
            TimestampDriftTolerance = builder.Configuration.GetValue<int>("Fido2:TimestampDriftTolerance", 300000)
        };
        return new Fido2(config);
    });

    // =====================================================
    // ریپازیتوری‌های ماژول امنیت
    // مدیریت سیاست‌های امنیتی و احراز هویت چندعاملی
    // =====================================================
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

    // =====================================================
    // سرویس‌های ماژول امنیت
    // مدیریت MFA، ارزیابی ریسک و سیاست‌های امنیتی
    // =====================================================
    builder.Services.AddScoped<IMfaService, MfaService>();
    builder.Services.AddScoped<IMfaChallengeService, MfaChallengeService>();
    builder.Services.AddScoped<IDeviceFingerprintService, DeviceFingerprintService>();
    builder.Services.AddScoped<IRiskEvaluationService, BasicRiskEvaluationService>();
    builder.Services.AddScoped<ISecurityPolicyService, SecurityPolicyService>();

    // =====================================================
    // ریپازیتوری‌های ماژول مجوزدهی
    // مدیریت سیاست‌ها و تخصیص‌های دسترسی
    // =====================================================
    builder.Services.AddScoped<IPolicyDefinitionRepository>(sp =>
        new PolicyDefinitionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IPolicyAssignmentRepository>(sp =>
        new PolicyAssignmentRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول مجوزدهی
    // ارزیابی سیاست‌های دسترسی
    // =====================================================
    builder.Services.AddScoped<IPolicyEvaluationService, PolicyEvaluationService>();

    // =====================================================
    // ریپازیتوری‌های ماژول درخواست دسترسی
    // مدیریت فرآیند درخواست و تأیید دسترسی
    // =====================================================
    builder.Services.AddScoped<IAccessRequestRepository>(sp =>
        new AccessRequestRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول درخواست دسترسی
    // موتور گردش کار تأیید دسترسی
    // =====================================================
    builder.Services.AddScoped<IWorkflowEngine, WorkflowEngineService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Privileged Access
    // مدیریت دسترسی ویژه، حساب‌های اضطراری و نشست‌های ممتاز
    // =====================================================
    builder.Services.AddScoped<IAccessApprovalFlowRepository, AccessApprovalFlowRepository>();
    builder.Services.AddScoped<IWorkflowDefinitionRepository, WorkflowDefinitionRepository>();
    builder.Services.AddScoped<IBreakGlassAccountRepository>(sp =>
        new BreakGlassAccountRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IJitGrantRepository>(sp =>
        new JitGrantRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IPrivilegedSessionRepository>(sp =>
        new PrivilegedSessionRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Privileged Access
    // مدیریت دسترسی موقت JIT
    // =====================================================
    builder.Services.AddScoped<IJitGrantService, JitGrantService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Adaptive Security
    // مدیریت سیاست‌های تطبیقی، سیگنال‌های امنیتی و کانتکست کاربران
    // =====================================================
    builder.Services.AddScoped<IAdaptivePolicyRepository>(sp =>
        new AdaptivePolicyRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ISecuritySignalRepository>(sp =>
        new SecuritySignalRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUserSecurityContextRepository>(sp =>
        new UserSecurityContextRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Adaptive Security
    // پردازش سیگنال‌ها، محاسبه ریسک و احراز هویت مبتنی بر ریسک
    // =====================================================
    builder.Services.AddScoped<ISecuritySignalProcessor, SecuritySignalProcessor>();
    builder.Services.AddScoped<IRiskCalculator, RiskCalculator>();
    builder.Services.AddScoped<IAdaptivePolicyEngine, AdaptivePolicyEngine>();
    builder.Services.AddScoped<IRiskBasedAuthenticationService, RiskBasedAuthenticationService>();
}

// سرویس‌های حاکمیت
// مدیریت چرخه حیات هویت، بینش‌های هویتی و فدراسیون
/// </summary>
static void ConfigureGovernanceServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول Identity Governance
    // مدیریت کمپین‌های بازبینی دسترسی، نقض SoD و بسته‌های دسترسی
    // =====================================================
    builder.Services.AddScoped<IAccessReviewCampaignRepository>(sp =>
        new AccessReviewCampaignRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ISodViolationRepository>(sp =>
        new SodViolationRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IAccessPackageRepository>(sp =>
        new AccessPackageRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // ریپازیتوری‌های ماژول Identity Lifecycle
    // مدیریت رکوردهای HR، رویدادها و سیاست‌های چرخه حیات
    // =====================================================
    builder.Services.AddScoped<IHRIdentityRecordRepository>(sp =>
        new HRIdentityRecordRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ILifecycleEventRepository>(sp =>
        new LifecycleEventRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ILifecyclePolicyRepository>(sp =>
        new LifecyclePolicyRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Identity Lifecycle
    // پردازش رویدادهای چرخه حیات و ارزیابی سیاست‌ها
    // =====================================================
    builder.Services.AddScoped<ILifecycleProcessor, LifecycleProcessorService>();
    builder.Services.AddScoped<ILifecyclePolicyEvaluator, LifecyclePolicyEvaluatorService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Identity Insights
    // مدیریت پروفایل‌های ریسک کاربران و تنانت‌ها و بینش‌ها
    // =====================================================
    builder.Services.AddScoped<IUserRiskProfileRepository>(sp =>
        new UserRiskProfileRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ITenantRiskProfileRepository>(sp =>
        new TenantRiskProfileRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IInsightRepository>(sp =>
        new InsightRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Identity Insights
    // محاسبه امتیاز ریسک و تولید بینش‌ها
    // =====================================================
    builder.Services.AddScoped<IRiskScoringService, RiskScoringService>();
    builder.Services.AddScoped<IInsightGenerationService, InsightGenerationService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Federation
    // مدیریت ارائه‌دهندگان OIDC، SAML و توکن‌های SCIM
    // =====================================================
    builder.Services.AddScoped<IOidcFederationProviderRepository>(sp =>
        new OidcFederationProviderRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ISamlProviderRepository>(sp =>
        new SamlProviderRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IScimTokenRepository>(sp =>
        new ScimTokenRepository(sp.GetRequiredService<OnesignDbContext>()));
}

// سرویس‌های عملیاتی
// اتوماسیون، مدیریت تغییرات، حوادث، شکار تهدید و بینش‌ها
/// </summary>
static void ConfigureOperationsServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول اتوماسیون
    // مدیریت گردش کارهای خودکار
    // =====================================================
    builder.Services.AddScoped<IAutomationWorkflowRepository>(sp =>
        new AutomationWorkflowRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IAutomationExecutionRepository>(sp =>
        new AutomationExecutionRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول اتوماسیون
    // موتور اجرای گردش کارهای خودکار
    // =====================================================
    builder.Services.AddScoped<IConditionEvaluator, ConditionEvaluatorService>();
    builder.Services.AddScoped<IActionExecutor, ActionExecutorService>();
    builder.Services.AddScoped<IAutomationEngine, AutomationEngineService>();
    builder.Services.AddScoped<Onesign.Modules.Automation.Application.Services.IAutomationTriggerService, Onesign.Modules.Automation.Application.Services.AutomationTriggerService>();

    // HttpClient برای وب‌هوک‌های اتوماسیون
    builder.Services.AddHttpClient("AutomationWebhook", client =>
    {
        client.Timeout = TimeSpan.FromSeconds(30);
    });

    // =====================================================
    // ریپازیتوری‌های ماژول مدیریت تغییرات
    // مدیریت درخواست‌های تغییر و تأییدیه‌ها
    // =====================================================
    builder.Services.AddScoped<IChangeSetRepository>(sp =>
        new ChangeSetRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IChangeApprovalRuleRepository>(sp =>
        new ChangeApprovalRuleRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IChangeApprovalRepository>(sp =>
        new ChangeApprovalRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IChangeExecutionLogRepository>(sp =>
        new ChangeExecutionLogRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول مدیریت تغییرات
    // شبیه‌سازی، اجرا و گردش کار تأیید تغییرات
    // =====================================================
    builder.Services.AddScoped<ISimulationEngine, SimulationEngine>();
    builder.Services.AddScoped<IChangeSetExecutionService, ChangeSetExecutionService>();
    builder.Services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();

    // =====================================================
    // ریپازیتوری‌های ماژول حوادث
    // مدیریت رویدادهای امنیتی و حوادث
    // =====================================================
    builder.Services.AddScoped<IIncidentRepository>(sp =>
        new IncidentRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IIncidentEventRepository>(sp =>
        new IncidentEventRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IIncidentNoteRepository>(sp =>
        new IncidentNoteRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول حوادث
    // تشخیص، همبستگی و مدیریت حوادث امنیتی
    // =====================================================
    builder.Services.AddScoped<IIncidentDetectionService, IncidentDetectionService>();
    builder.Services.AddScoped<IIncidentCorrelationService, IncidentCorrelationService>();
    builder.Services.AddScoped<IIncidentTimelineService, IncidentTimelineService>();
    builder.Services.AddScoped<IIncidentPlaybookService, IncidentPlaybookService>();

    // =====================================================
    // ریپازیتوری‌های ماژول شکار تهدید
    // مدیریت کوئری‌ها و شکارهای زمان‌بندی شده
    // =====================================================
    builder.Services.AddScoped<ISavedQueryRepository>(sp =>
        new SavedQueryRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IScheduledHuntRepository>(sp =>
        new ScheduledHuntRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IHuntRunRepository>(sp =>
        new HuntRunRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول شکار تهدید
    // پارسر و اجراکننده زبان OQL
    // =====================================================
    builder.Services.AddScoped<IOqlParser, OqlParser>();
    builder.Services.AddScoped<IOqlExecutor, OqlExecutor>();
    builder.Services.AddScoped<IScheduledHuntRunner, ScheduledHuntRunner>();
    builder.Services.AddScoped<IHuntActionExecutor, HuntActionExecutor>();

    // =====================================================
    // ریپازیتوری‌های ماژول بینش‌ها
    // مدیریت گزارش‌ها و آمارهای استفاده
    // =====================================================
    builder.Services.AddScoped<ITenantDailyUsageSnapshotRepository>(sp =>
        new TenantDailyUsageSnapshotRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IApplicationDailyUsageSnapshotRepository>(sp =>
        new ApplicationDailyUsageSnapshotRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUserSecurityPostureRepository>(sp =>
        new UserSecurityPostureRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IReportSubscriptionRepository>(sp =>
        new ReportSubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول بینش‌ها
    // جمع‌آوری، تولید گزارش و صادرات داده‌ها
    // =====================================================
    builder.Services.AddScoped<IInsightsAggregationService, InsightsAggregationService>();
    builder.Services.AddScoped<IReportGenerationService, ReportGenerationService>();
    builder.Services.AddScoped<IExportService, ExportService>();
}

// سرویس‌های پلتفرم
// مدیریت نسخه، استقرار، چندمنطقه‌ای، رمزنگاری و مستاجرین
/// </summary>
static void ConfigurePlatformServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول تننت
    // مدیریت اطلاعات مستاجرین و پیکربندی آنها
    // =====================================================
    builder.Services.AddScoped<ITenantRepository>(sp =>
        new TenantRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ITenantConfigRepository>(sp =>
        new TenantConfigRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IEmailTemplateRepository>(sp =>
        new EmailTemplateRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // ریپازیتوری‌های ماژول پلتفرم
    // مدیریت نسخه‌ها، مهاجرت‌ها و تست‌های یکپارچگی
    // =====================================================
    builder.Services.AddScoped<IPlatformVersionRepository>(sp =>
        new PlatformVersionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IMigrationHistoryRepository>(sp =>
        new MigrationHistoryRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IIntegrationTestResultRepository>(sp =>
        new IntegrationTestResultRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول پلتفرم
    // سلامت سیستم، نسخه‌بندی، مهاجرت و تشخیص خطا
    // =====================================================
    builder.Services.AddScoped<IPlatformHealthAggregator, PlatformHealthAggregator>();
    builder.Services.AddScoped<IPlatformVersionService, PlatformVersionService>();
    builder.Services.AddScoped<IMigrationService, MigrationService>();
    builder.Services.AddScoped<IApiDocumentationService, ApiDocumentationService>();
    // Shared version for PlatformController
    builder.Services.AddScoped<Onesign.Shared.Platform.Services.IApiDocumentationService, Onesign.Shared.Platform.Services.Implementations.ApiDocumentationService>();
    builder.Services.AddScoped<IDiagnosticsService, DiagnosticsService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Multi-Region
    // مدیریت مناطق جغرافیایی مختلف و پشتیبان‌گیری
    // =====================================================
    builder.Services.AddScoped<IRegionRepository>(sp =>
        new RegionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ITenantBackupSetRepository>(sp =>
        new TenantBackupSetRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IRegionBackupSetRepository>(sp =>
        new RegionBackupSetRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ITenantDataResidencyRepository>(sp =>
        new TenantDataResidencyRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Multi-Region
    // پشتیبان‌گیری، بازیابی، failover و نظارت بر سلامت
    // =====================================================
    builder.Services.AddScoped<IBackupService, BackupService>();
    builder.Services.AddScoped<IRestoreService, RestoreService>();
    builder.Services.AddScoped<IFailoverService, FailoverService>();
    builder.Services.AddScoped<IRegionHealthMonitor, RegionHealthMonitor>();
    builder.Services.AddScoped<ITenantDataResidencyService, TenantDataResidencyService>();

    // =====================================================
    // ریپازیتوری‌های ماژول Crypto
    // مدیریت نسخه‌های کلید و مجموعه کلیدها
    // =====================================================
    builder.Services.AddScoped<IKeyVersionRepository>(sp =>
        new KeyVersionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IKeySetRepository>(sp =>
        new KeySetRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IKeyRotationPolicyRepository>(sp =>
        new KeyRotationPolicyRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Crypto
    // تولید، ذخیره، چرخش و ابطال کلیدهای رمزنگاری
    // =====================================================
    builder.Services.AddScoped<IKeyGenerator, KeyGenerator>();
    builder.Services.AddScoped<IKeyProvider, JwksKeyProvider>();
    builder.Services.AddScoped<IKeyStore, LocalKeyStore>();
    builder.Services.AddScoped<IKeyRevocationService, KeyRevocationService>();
    builder.Services.AddScoped<IKeyRolloverService, KeyRolloverService>();
    builder.Services.AddScoped<IKeyRotationEngine, KeyRotationEngine>();

    // =====================================================
    // ریپازیتوری‌های ماژول Deployment
    // مدیریت محیط‌های استقرار و پیکربندی ویژگی‌ها
    // =====================================================
    builder.Services.AddScoped<IDeploymentEnvironmentRepository>(sp =>
        new DeploymentEnvironmentRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IEnvironmentFeatureConfigRepository>(sp =>
        new EnvironmentFeatureConfigRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Deployment
    // راه‌اندازی، مقداردهی اولیه، اعتبارسنجی لایسنس و مدیریت ویژگی‌ها
    // =====================================================
    builder.Services.AddScoped<IEnvironmentBootstrapService, EnvironmentBootstrapService>();
    builder.Services.AddScoped<IDeploymentInitializer, DeploymentInitializer>();
    builder.Services.AddScoped<ILicenseValidator, LicenseValidator>();
    builder.Services.AddScoped<IFeatureGateService, FeatureGateService>();
}

/// <summary>
/// سرویس‌های کسب و کار
/// مدیریت سازمان، واحدهای سازمانی و اپلیکیشن‌ها
/// </summary>
static void ConfigureBusinessServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول سازمان
    // مدیریت واحدهای سازمانی و نمایندگان مدیریتی
    // =====================================================
    builder.Services.AddScoped<IOrgUnitRepository>(sp =>
        new OrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUserOrgUnitRepository>(sp =>
        new UserOrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IApplicationOrgUnitRepository>(sp =>
        new ApplicationOrgUnitRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IDelegatedAdminRepository>(sp =>
        new DelegatedAdminRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول سازمان
    // مدیریت درخت سازمانی و مجوزدهی سازمانی
    // =====================================================
    builder.Services.AddScoped<IOrgTreeService, OrgTreeService>();
    builder.Services.AddScoped<IOrgAuthorizationService, OrgAuthorizationService>();

    // =====================================================
    // ریپازیتوری‌های ماژول اپلیکیشن‌ها
    // مدیریت کلاینت‌های OAuth و کلیدهای محرمانه
    // =====================================================
    builder.Services.AddScoped<IApplicationClientRepository>(sp =>
        new ApplicationClientRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<Onesign.Modules.Applications.Domain.Repositories.IClientSecretRepository>(sp =>
        new Onesign.Modules.Applications.Infrastructure.EfCore.Repositories.ClientSecretRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // ریپازیتوری‌های ماژول Billing
    // مدیریت پلن‌ها، اشتراک‌ها و استفاده
    // =====================================================
    builder.Services.AddScoped<IPlanRepository>(sp =>
        new PlanRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ISubscriptionRepository>(sp =>
        new SubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUsageRepository>(sp =>
        new UsageRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // ریپازیتوری‌های ماژول User Management
    // مدیریت فعالیت‌ها و پروفایل‌های کاربران
    // =====================================================
    builder.Services.AddScoped<IUserActivityRepository>(sp =>
        new UserActivityRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IUserProfileRepository>(sp =>
        new UserProfileRepository(sp.GetRequiredService<OnesignDbContext>()));
}

/// <summary>
/// سرویس‌های یکپارچه‌سازی
/// حسابرسی، توسعه‌دهنده، مرکز اعلان‌ها، توسعه‌پذیری و دستیار هوشمند
/// </summary>
static void ConfigureIntegrationServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ریپازیتوری‌های ماژول حسابرسی
    // ذخیره و بازیابی رویدادهای حسابرسی
    // =====================================================
    builder.Services.AddScoped<IAuditEventRepository>(sp =>
        new AuditEventRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // ریپازیتوری‌های ماژول توسعه‌دهنده
    // مدیریت کلیدهای API و حساب‌های سرویس
    // =====================================================
    builder.Services.AddScoped<IApiKeyRepository>(sp =>
        new ApiKeyRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IServiceAccountRepository>(sp =>
        new ServiceAccountRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IApiUsageLogRepository>(sp =>
        new ApiUsageLogRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول توسعه‌دهنده
    // مدیریت و اعتبارسنجی کلیدهای API
    // =====================================================
    builder.Services.AddScoped<IApiKeyService, ApiKeyService>();

    // =====================================================
    // ریپازیتوری‌های ماژول مرکز اعلان‌ها
    // مدیریت قالب‌ها، صف ارسال و اشتراک‌های اعلان
    // =====================================================
    builder.Services.AddScoped<INotificationTemplateRepository>(sp =>
        new NotificationTemplateRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<INotificationOutboxRepository>(sp =>
        new NotificationOutboxRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<INotificationEventSubscriptionRepository>(sp =>
        new NotificationEventSubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<INotificationChannelConfigRepository>(sp =>
        new NotificationChannelConfigRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<INotificationDeliveryLogRepository>(sp =>
        new NotificationDeliveryLogRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول مرکز اعلان‌ها
    // مسیریابی و ارسال اعلان‌ها
    // =====================================================
    builder.Services.AddScoped<INotificationRouter, NotificationRouterService>();

    // =====================================================
    // ریپازیتوری‌های ماژول دستیار هوشمند
    // مدیریت مکالمات و تاریخچه دستیار
    // =====================================================
    builder.Services.AddScoped<ICopilotConversationRepository>(sp =>
        new CopilotConversationRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول دستیار هوشمند
    // ساخت کانتکست، هماهنگی و اجرای دستورات
    // =====================================================
    builder.Services.AddScoped<ICopilotContextBuilder, CopilotContextBuilder>();
    builder.Services.AddScoped<ICopilotOrchestrator, CopilotOrchestrator>();
    builder.Services.AddScoped<ICopilotResponseGenerator, CopilotResponseGenerator>();
    builder.Services.AddScoped<ICopilotActionExecutor, CopilotActionExecutor>();

    // =====================================================
    // ریپازیتوری‌های ماژول Privacy
    // مدیریت سیاست‌های نگهداری و درخواست‌های موضوع داده
    // =====================================================
    builder.Services.AddScoped<IDataRetentionPolicyRepository>(sp =>
        new DataRetentionPolicyRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IDataSubjectRequestRepository>(sp =>
        new DataSubjectRequestRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Privacy
    // مدیریت حفظ، ناشناس‌سازی، پردازش درخواست‌ها و صادرات داده‌ها
    // =====================================================
    builder.Services.AddScoped<IDataRetentionService, DataRetentionService>();
    builder.Services.AddScoped<IAnonymizationService, AnonymizationService>();
    builder.Services.AddScoped<IDataExportService, DataExportService>();
    builder.Services.AddScoped<IDataSubjectRequestProcessor, DataSubjectRequestProcessor>();

    // =====================================================
    // ریپازیتوری‌های ماژول Extensibility
    // مدیریت هوک‌های ورود، وب‌هوک‌ها و قوانین تبدیل توکن
    // =====================================================
    builder.Services.AddScoped<ILoginHookRepository>(sp =>
        new LoginHookRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IWebhookSubscriptionRepository>(sp =>
        new WebhookSubscriptionRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<IWebhookDeliveryLogRepository>(sp =>
        new WebhookDeliveryLogRepository(sp.GetRequiredService<OnesignDbContext>()));
    builder.Services.AddScoped<ITokenTransformationRuleRepository>(sp =>
        new TokenTransformationRuleRepository(sp.GetRequiredService<OnesignDbContext>()));

    // =====================================================
    // سرویس‌های ماژول Extensibility
    // اجرای هوک‌ها، انتشار رویدادها و تحویل وب‌هوک‌ها
    // =====================================================
    builder.Services.AddScoped<ILoginHookExecutor, LoginHookExecutor>();
    builder.Services.AddScoped<IEventPublisher, EventPublisher>();
    builder.Services.AddScoped<IWebhookDeliveryService, WebhookDeliveryService>();
    builder.Services.AddScoped<ITokenTransformationEngine, TokenTransformationEngine>();
}

/// <summary>
/// سرویس‌های پس‌زمینه
/// تمام کارهای زمان‌بندی شده و پردازش‌های غیرهمزمان
/// </summary>
static void ConfigureBackgroundServices(WebApplicationBuilder builder)
{
    // =====================================================
    // سرویس‌های پاکسازی و نگهداری
    // پاکسازی نشست‌ها، کلیدها و رکوردهای قدیمی
    // =====================================================
    builder.Services.AddHostedService<SessionCleanupService>();
    builder.Services.AddHostedService<ClientSecretCleanupService>();
    builder.Services.AddHostedService<AuditCleanupWorker>();
    builder.Services.AddHostedService<RetentionCleanupWorker>();

    // =====================================================
    // سرویس‌های ارسال و اطلاع‌رسانی
    // ارسال اعلان‌ها و وب‌هوک‌ها
    // =====================================================
    builder.Services.AddHostedService<NotificationDeliveryWorker>();
    builder.Services.AddHostedService<WebhookDeliveryWorker>();

    // =====================================================
    // سرویس‌های پردازش چرخه حیات و دسترسی
    // مدیریت چرخه حیات کاربران و دسترسی‌های موقت
    // =====================================================
    builder.Services.AddHostedService<LifecycleProcessorWorker>();
    builder.Services.AddHostedService<JitExpiryWorker>();

    // =====================================================
    // سرویس‌های امنیتی و ریسک
    // ارزیابی ریسک و چرخش کلیدها
    // =====================================================
    builder.Services.AddHostedService<RiskScoringWorker>();
    builder.Services.AddHostedService<KeyRotationWorker>();

    // =====================================================
    // سرویس‌های پشتیبان‌گیری و سلامت
    // پشتیبان‌گیری زمان‌بندی شده و بررسی سلامت سیستم
    // =====================================================
    builder.Services.AddHostedService<BackupSchedulerWorker>();
    builder.Services.AddHostedService<HealthCheckWorker>();

    // =====================================================
    // سرویس‌های تحلیل و گزارش‌گیری
    // تولید بینش‌ها و گزارش‌های زمان‌بندی شده
    // =====================================================
    builder.Services.AddHostedService<InsightGenerationWorker>();
    builder.Services.AddHostedService<DailyInsightsAggregationJob>();
    builder.Services.AddHostedService<ScheduledReportsJob>();

    // =====================================================
    // سرویس‌های اتوماسیون و شکار تهدید
    // پردازش رویدادها و اجرای شکارهای زمان‌بندی شده
    // =====================================================
    builder.Services.AddHostedService<AutomationEventProcessor>();
    builder.Services.AddHostedService<ScheduledChangeSetApplyJob>();
    builder.Services.AddHostedService<ScheduledHuntsRunnerJob>();
}

/// <summary>
/// پیکربندی میدلورها
/// تنظیم پایپلاین درخواست HTTP شامل امنیت، احراز هویت و مجوزدهی
/// </summary>
static void ConfigureMiddleware(WebApplication app)
{
    // =====================================================
    // محیط توسعه - فعال‌سازی Swagger
    // =====================================================
    //if (app.Environment.IsDevelopment())
    //{
    app.UseSwagger();
    app.UseSwaggerUI();
    //}

    // =====================================================
    // تنظیمات پایه HTTP
    // =====================================================
    app.UseCors();
    app.UseHttpsRedirection();
    app.UseSession();

    // =====================================================
    // میدلور هدرهای امنیتی
    // اولین میدلور برای اطمینان از وجود هدرها در تمام پاسخ‌ها
    // =====================================================
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // =====================================================
    // میدلور مدیریت خطای سراسری
    // باید در ابتدای پایپلاین باشد برای گرفتن تمام خطاها
    // =====================================================
    app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

    // =====================================================
    // میدلور محدودیت نرخ بر اساس IP
    // محافظت پایه در برابر حملات
    // =====================================================
    app.UseMiddleware<RateLimitMiddleware>();

    // =====================================================
    // میدلور قفل ورود
    // جلوگیری از تلاش‌های ورود بیش از حد از IP های قفل شده
    // =====================================================
    app.UseMiddleware<LoginLockoutMiddleware>();

    // =====================================================
    // میدلور محلی‌سازی
    // باید قبل از کنترلرها باشد برای ترجمه پیام‌ها
    // =====================================================
    app.UseMiddleware<LocalizationMiddleware>();

    // =====================================================
    // میدلور احراز هویت JWT
    // باید قبل از UseAuthorization باشد
    // =====================================================
    app.UseMiddleware<JwtAuthenticationMiddleware>();

    // =====================================================
    // میدلورهای مدیریت مستاجر
    // جداسازی، بررسی وضعیت و محدودیت نرخ بر اساس تننت
    // =====================================================

    // استخراج و اعتبارسنجی کانتکست مستاجر
    app.UseMiddleware<TenantIsolationMiddleware>();

    // بررسی وضعیت مستاجر (معلق/تعمیرات)
    app.UseMiddleware<TenantStatusMiddleware>();

    // اعمال محدودیت نرخ بر اساس پلن مستاجر
    app.UseMiddleware<TenantRateLimitMiddleware>();

    // =====================================================
    // میدلورهای احراز هویت و مجوزدهی فریم‌ورک
    // =====================================================
    app.UseAuthentication();
    app.UseAuthorization();

    // =====================================================
    // نقشه‌برداری کنترلرها
    // =====================================================
    app.MapControllers();
}
