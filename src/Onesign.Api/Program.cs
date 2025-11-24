using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.BackgroundServices;
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

builder.Services.AddScoped<IAccessRequestWorkflowEngine, AccessRequestWorkflowEngineService>();

var app = builder.Build();

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
    // مدیریت نشست کاربر
    // ذخیره‌سازی موقت اطلاعات نشست در حافظه
    // =====================================================
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
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // =====================================================
    // پایگاه داده
    // اتصال به SQL Server با Entity Framework Core
    // =====================================================
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=OnesignDb;Trusted_Connection=True;MultipleActiveResultSets=true";

    builder.Services.AddDbContext<OnesignDbContext>(options =>
        options.UseSqlServer(connectionString));

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
    // سرویس ایمیل (اختیاری)
    // فقط در صورت پیکربندی SMTP فعال می‌شود
    // =====================================================
    var smtpHost = builder.Configuration["Email:Smtp:Host"];
    if (!string.IsNullOrEmpty(smtpHost))
    {
        builder.Services.AddScoped<Onesign.Shared.Email.IEmailService, Onesign.Shared.Email.SmtpEmailService>();
    }

    // =====================================================
    // سرویس محلی‌سازی
    // پشتیبانی از چند زبانه
    // =====================================================
    builder.Services.AddScoped<Onesign.Shared.Localization.ILocalizationService, Onesign.Shared.Localization.LocalizationService>();

    // =====================================================
    // HttpClient برای سرویس‌های خارجی
    // =====================================================
    builder.Services.AddHttpClient();

    // =====================================================
    // سرویس‌های پلتفرم - سخت‌سازی و مقیاس‌پذیری
    // =====================================================
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();
    builder.Services.AddSingleton<IResourceQuotaService, ResourceQuotaService>();
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

    // =====================================================
    // سرویس‌های ماژول هویت
    // رمزنگاری پسورد و احراز هویت
    // =====================================================
    builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
    builder.Services.AddScoped<IAuthService>(sp =>
        new AuthService(
            sp.GetRequiredService<Onesign.Shared.Security.IJwtSigningKeyProvider>(),
            sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>()));

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
}

// سرویس‌های حاکمیت
// مدیریت چرخه حیات هویت، بینش‌های هویتی و فدراسیون
/// </summary>
static void ConfigureGovernanceServices(WebApplicationBuilder builder)
{
    // =====================================================
    // ماژول‌های حاکمیت هویت
    // این ماژول‌ها فقط از طریق MediatR ثبت شده‌اند
    // شامل: IdentityLifecycle, IdentityInsights, Federation
    // =====================================================
    // سرویس‌های این بخش در MediatR registration در ConfigureSharedServices ثبت شده‌اند
    // - IdentityLifecycle: مدیریت چرخه حیات کاربران (ورود، خروج، تغییر نقش)
    // - IdentityInsights: تحلیل و گزارش‌گیری از رفتار کاربران
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
    builder.Services.AddScoped<IDiagnosticsService, DiagnosticsService>();
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
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

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
    app.UseMiddleware<Onesign.Api.Middleware.SecurityHeadersMiddleware>();

    // =====================================================
    // میدلور مدیریت خطای سراسری
    // باید در ابتدای پایپلاین باشد برای گرفتن تمام خطاها
    // =====================================================
    app.UseMiddleware<Onesign.Api.Middleware.GlobalExceptionHandlerMiddleware>();

    // =====================================================
    // میدلور محدودیت نرخ بر اساس IP
    // محافظت پایه در برابر حملات
    // =====================================================
    app.UseMiddleware<Onesign.Api.Middleware.RateLimitMiddleware>();

    // =====================================================
    // میدلور محلی‌سازی
    // باید قبل از کنترلرها باشد برای ترجمه پیام‌ها
    // =====================================================
    app.UseMiddleware<Onesign.Api.Middleware.LocalizationMiddleware>();

    // =====================================================
    // میدلور احراز هویت JWT
    // باید قبل از UseAuthorization باشد
    // =====================================================
    app.UseMiddleware<Onesign.Api.Middleware.JwtAuthenticationMiddleware>();

    // =====================================================
    // میدلورهای مدیریت مستاجر
    // جداسازی، بررسی وضعیت و محدودیت نرخ بر اساس تننت
    // =====================================================

    // استخراج و اعتبارسنجی کانتکست مستاجر
    app.UseMiddleware<Onesign.Api.Middleware.TenantIsolationMiddleware>();

    // بررسی وضعیت مستاجر (معلق/تعمیرات)
    app.UseMiddleware<Onesign.Api.Middleware.TenantStatusMiddleware>();

    // اعمال محدودیت نرخ بر اساس پلن مستاجر
    app.UseMiddleware<Onesign.Api.Middleware.TenantRateLimitMiddleware>();

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
