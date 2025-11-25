using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Api.Data;

/// <summary>
/// Seeds the database with comprehensive test data for development
/// </summary>
public static class DatabaseSeeder
{
    // Well-known IDs for test data
    public static readonly Guid TestTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid TestGlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid TestTenantUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid TestAdminUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly string TestRegionId = "default-region";
    public static readonly Guid TestOrgUnitId = Guid.Parse("66666666-6666-6666-6666-666666666666");
    public static readonly Guid TestApplicationId = Guid.Parse("77777777-7777-7777-7777-777777777777");
    public static readonly Guid TestServiceAccountId = Guid.Parse("88888888-8888-8888-8888-888888888888");
    public static readonly Guid TestApiKeyId = Guid.Parse("99999999-9999-9999-9999-999999999999");
    public static readonly Guid TestPlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid TestAccessPackageId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    public static async Task SeedAsync(OnesignDbContext context, ILogger logger)
    {
        logger.LogInformation("Starting comprehensive database seeding...");

        try
        {
            // === Core Identity ===
            await SeedRegionAsync(context, logger);
            await SeedTenantAsync(context, logger);
            await SeedPlansAsync(context, logger);
            await SeedGlobalUserAsync(context, logger);
            await SeedTenantUsersAsync(context, logger);
            await SeedOrgUnitsAsync(context, logger);
            await SeedUserOrgUnitsAsync(context, logger);
            await SeedApplicationsAsync(context, logger);
            
            // === Security ===
            await SeedSecurityPoliciesAsync(context, logger);
            await SeedTrustedDevicesAsync(context, logger);
            await SeedRiskEventsAsync(context, logger);
            await SeedAdaptivePoliciesAsync(context, logger);
            
            // === Privileged Access ===
            await SeedJitGrantsAsync(context, logger);
            await SeedBreakGlassAccountsAsync(context, logger);
            
            // === Governance ===
            await SeedAccessPackagesAsync(context, logger);
            await SeedAccessRequestsAsync(context, logger);
            await SeedChangeSetsAsync(context, logger);
            
            // === Integration ===
            await SeedServiceAccountsAsync(context, logger);
            await SeedApiKeysAsync(context, logger);
            await SeedWebhookSubscriptionsAsync(context, logger);
            
            // === Notifications ===
            await SeedNotificationTemplatesAsync(context, logger);
            await SeedNotificationChannelConfigsAsync(context, logger);
            
            // === Audit & Observability ===
            await SeedAuditEventsAsync(context, logger);
            
            // === Platform ===
            await SeedPlatformVersionAsync(context, logger);

            await context.SaveChangesAsync();
            logger.LogInformation("Comprehensive database seeding completed successfully!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database seeding");
            throw;
        }
    }

    #region Core Identity

    private static async Task SeedRegionAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Regions.AnyAsync(r => r.Id == TestRegionId)) return;

        var regions = new List<RegionEntity>
        {
            new() { Id = TestRegionId, DisplayName = "Default Region (Local)", IsActive = true, EndpointBaseUrl = "http://localhost:7000", DbClusterRef = "local", StorageClusterRef = "local", Status = 1, CreatedAt = DateTime.UtcNow },
            new() { Id = "eu-west-1", DisplayName = "Europe (Frankfurt)", IsActive = true, EndpointBaseUrl = "https://eu.onesign.io", DbClusterRef = "eu-cluster-1", StorageClusterRef = "eu-storage-1", Status = 1, CreatedAt = DateTime.UtcNow },
            new() { Id = "us-east-1", DisplayName = "US East (Virginia)", IsActive = true, EndpointBaseUrl = "https://us.onesign.io", DbClusterRef = "us-cluster-1", StorageClusterRef = "us-storage-1", Status = 1, CreatedAt = DateTime.UtcNow }
        };

        context.Regions.AddRange(regions);
        logger.LogInformation("Created {Count} regions", regions.Count);
    }

    private static async Task SeedTenantAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Tenants.AnyAsync(t => t.Id == TestTenantId)) return;

        var tenant = new TenantEntity
        {
            Id = TestTenantId,
            Name = "Test Organization",
            Slug = "test-org",
            Status = Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Tenants.Add(tenant);

        // Add Tenant Config
        var config = new TenantConfigEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            LogoUrl = "https://placeholder.com/logo.png",
            PrimaryColor = "#4F46E5",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.TenantConfigs.Add(config);

        // Add Data Residency
        var dataResidency = new TenantDataResidencyEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            DataRegionId = TestRegionId,
            BackupRegionId = "eu-west-1",
            ComplianceTag = "GDPR",
            CrossRegionReplicationAllowed = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.TenantDataResidencies.Add(dataResidency);

        logger.LogInformation("Created tenant: {TenantName}", tenant.Name);
    }

    private static async Task SeedPlansAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Plans.AnyAsync()) return;

        var plans = new List<PlanEntity>
        {
            new() { Id = Guid.NewGuid(), Name = "Free", Code = "FREE", Type = PlanType.Free, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = TestPlanId, Name = "Professional", Code = "PRO", Type = PlanType.Pro, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Enterprise", Code = "ENT", Type = PlanType.Enterprise, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Custom", Code = "CUSTOM", Type = PlanType.Custom, IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        context.Plans.AddRange(plans);
        logger.LogInformation("Created {Count} plans", plans.Count);
    }

    private static async Task SeedGlobalUserAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.GlobalUsers.AnyAsync(u => u.Id == TestGlobalUserId)) return;

        var users = new List<GlobalUserEntity>
        {
            new() { Id = TestGlobalUserId, Email = "admin@test.local", PasswordHash = "$2a$11$testpasswordhash", EmailVerified = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222223"), Email = "user@test.local", PasswordHash = "$2a$11$testpasswordhash", EmailVerified = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222224"), Email = "manager@test.local", PasswordHash = "$2a$11$testpasswordhash", EmailVerified = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222225"), Email = "auditor@test.local", PasswordHash = "$2a$11$testpasswordhash", EmailVerified = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222226"), Email = "helpdesk@test.local", PasswordHash = "$2a$11$testpasswordhash", EmailVerified = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.GlobalUsers.AddRange(users);
        logger.LogInformation("Created {Count} global users", users.Count);
    }

    private static async Task SeedTenantUsersAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.TenantUsers.AnyAsync(u => u.Id == TestAdminUserId)) return;

        var users = new List<TenantUserEntity>
        {
            new() { Id = TestAdminUserId, TenantId = TestTenantId, GlobalUserId = TestGlobalUserId, IsAdmin = true, IsActive = true, Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active, IsLocked = false, RequireMfaNextSignIn = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = TestTenantUserId, TenantId = TestTenantId, GlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222223"), IsAdmin = false, IsActive = true, Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active, IsLocked = false, RequireMfaNextSignIn = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444445"), TenantId = TestTenantId, GlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222224"), IsAdmin = false, IsActive = true, Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active, IsLocked = false, RequireMfaNextSignIn = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444446"), TenantId = TestTenantId, GlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222225"), IsAdmin = false, IsActive = true, Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active, IsLocked = false, RequireMfaNextSignIn = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444447"), TenantId = TestTenantId, GlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222226"), IsAdmin = false, IsActive = true, Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active, IsLocked = false, RequireMfaNextSignIn = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.TenantUsers.AddRange(users);
        logger.LogInformation("Created {Count} tenant users", users.Count);
    }

    private static async Task SeedOrgUnitsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.OrgUnits.AnyAsync(o => o.Id == TestOrgUnitId)) return;

        var itDeptId = Guid.NewGuid();
        var hrDeptId = Guid.NewGuid();
        var financeDeptId = Guid.NewGuid();
        var salesDeptId = Guid.NewGuid();

        var orgUnits = new List<OrgUnitEntity>
        {
            new() { Id = TestOrgUnitId, TenantId = TestTenantId, Name = "Headquarters", Code = "HQ", ParentId = null, Path = "/HQ", Level = 0, SortOrder = 0, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = itDeptId, TenantId = TestTenantId, Name = "IT Department", Code = "IT", ParentId = TestOrgUnitId, Path = "/HQ/IT", Level = 1, SortOrder = 1, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = hrDeptId, TenantId = TestTenantId, Name = "Human Resources", Code = "HR", ParentId = TestOrgUnitId, Path = "/HQ/HR", Level = 1, SortOrder = 2, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = financeDeptId, TenantId = TestTenantId, Name = "Finance", Code = "FIN", ParentId = TestOrgUnitId, Path = "/HQ/FIN", Level = 1, SortOrder = 3, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = salesDeptId, TenantId = TestTenantId, Name = "Sales", Code = "SALES", ParentId = TestOrgUnitId, Path = "/HQ/SALES", Level = 1, SortOrder = 4, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "DevOps Team", Code = "DEVOPS", ParentId = itDeptId, Path = "/HQ/IT/DEVOPS", Level = 2, SortOrder = 1, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Security Team", Code = "SEC", ParentId = itDeptId, Path = "/HQ/IT/SEC", Level = 2, SortOrder = 2, Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.OrgUnits.AddRange(orgUnits);
        logger.LogInformation("Created {Count} org units", orgUnits.Count);
    }

    private static async Task SeedUserOrgUnitsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.UserOrgUnits.AnyAsync(u => u.TenantUserId == TestAdminUserId)) return;

        var userOrgUnits = new List<UserOrgUnitEntity>
        {
            new() { TenantUserId = TestAdminUserId, OrgUnitId = TestOrgUnitId, IsPrimary = true },
            new() { TenantUserId = TestTenantUserId, OrgUnitId = TestOrgUnitId, IsPrimary = true }
        };

        context.UserOrgUnits.AddRange(userOrgUnits);
        logger.LogInformation("Created {Count} user-orgunit mappings", userOrgUnits.Count);
    }

    private static async Task SeedApplicationsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.ApplicationClients.AnyAsync(a => a.Id == TestApplicationId)) return;

        var apps = new List<ApplicationClientEntity>
        {
            new() { Id = TestApplicationId, TenantId = TestTenantId, Name = "Test Web Application", ClientId = "test-web-app", ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.Web, GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCode, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Mobile Banking App", ClientId = "mobile-banking", ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.Mobile, GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCodeWithPkce, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Admin Portal SPA", ClientId = "admin-portal-spa", ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.SPA, GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCodeWithPkce, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "HR System", ClientId = "hr-system", ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.Web, GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCode, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "CRM Dashboard", ClientId = "crm-dashboard", ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.SPA, GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCodeWithPkce, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.ApplicationClients.AddRange(apps);
        logger.LogInformation("Created {Count} applications", apps.Count);
    }

    #endregion

    #region Security

    private static async Task SeedSecurityPoliciesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.SecurityPolicies.AnyAsync(p => p.TenantId == TestTenantId)) return;

        var policy = new SecurityPolicyEntity
        {
            TenantId = TestTenantId,
            MfaRequirementLevel = MfaRequirementLevel.None,
            AllowMfaRememberDevice = true,
            RememberDeviceDays = 30,
            RequireMfaForSensitiveApps = false,
            MaxFailedLoginAttempts = 5,
            EnableGeoAnomalyDetection = true,
            BlockLevel = RiskLevel.High,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.SecurityPolicies.Add(policy);
        logger.LogInformation("Created security policy");
    }

    private static async Task SeedTrustedDevicesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.TrustedDevices.AnyAsync(d => d.TenantUserId == TestAdminUserId)) return;

        var devices = new List<TrustedDeviceEntity>
        {
            new() { Id = Guid.NewGuid(), TenantUserId = TestAdminUserId, DeviceId = "dev-laptop-001", DeviceName = "Admin's MacBook Pro", FirstSeenAt = DateTime.UtcNow.AddDays(-30), LastSeenAt = DateTime.UtcNow.AddHours(-1), ExpiresAt = DateTime.UtcNow.AddDays(60), CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { Id = Guid.NewGuid(), TenantUserId = TestAdminUserId, DeviceId = "dev-phone-001", DeviceName = "Admin's iPhone 15", FirstSeenAt = DateTime.UtcNow.AddDays(-15), LastSeenAt = DateTime.UtcNow.AddHours(-3), ExpiresAt = DateTime.UtcNow.AddDays(45), CreatedAt = DateTime.UtcNow.AddDays(-15) },
            new() { Id = Guid.NewGuid(), TenantUserId = TestTenantUserId, DeviceId = "dev-desktop-002", DeviceName = "User's Windows PC", FirstSeenAt = DateTime.UtcNow.AddDays(-7), LastSeenAt = DateTime.UtcNow.AddHours(-5), ExpiresAt = DateTime.UtcNow.AddDays(23), CreatedAt = DateTime.UtcNow.AddDays(-7) },
            new() { Id = Guid.NewGuid(), TenantUserId = TestTenantUserId, DeviceId = "dev-tablet-001", DeviceName = "User's iPad", FirstSeenAt = DateTime.UtcNow.AddDays(-3), LastSeenAt = DateTime.UtcNow.AddDays(-1), ExpiresAt = DateTime.UtcNow.AddDays(27), CreatedAt = DateTime.UtcNow.AddDays(-3) }
        };

        context.TrustedDevices.AddRange(devices);
        logger.LogInformation("Created {Count} trusted devices", devices.Count);
    }

    private static async Task SeedRiskEventsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.RiskEvents.AnyAsync(r => r.TenantId == TestTenantId)) return;

        var events = new List<RiskEventEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TenantUserId = TestTenantUserId, EventType = RiskEventType.NewDeviceLogin, RiskLevel = RiskLevel.Low, IpAddress = "192.168.1.150", Country = "US", DeviceId = "new-device-xyz", DetailsJson = "{\"browser\": \"Chrome\", \"os\": \"Windows 11\"}", CreatedAt = DateTime.UtcNow.AddHours(-12) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TenantUserId = TestTenantUserId, EventType = RiskEventType.MultipleFailedLogins, RiskLevel = RiskLevel.Medium, IpAddress = "203.0.113.50", Country = "CN", DeviceId = "unknown", DetailsJson = "{\"attempts\": 5, \"timeWindow\": \"5 minutes\"}", CreatedAt = DateTime.UtcNow.AddHours(-6) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TenantUserId = TestAdminUserId, EventType = RiskEventType.GeoAnomaly, RiskLevel = RiskLevel.High, IpAddress = "198.51.100.25", Country = "RU", DeviceId = "dev-laptop-001", DetailsJson = "{\"previousCountry\": \"US\", \"timeSinceLastLogin\": \"2 hours\"}", CreatedAt = DateTime.UtcNow.AddHours(-1) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TenantUserId = TestAdminUserId, EventType = RiskEventType.SuspiciousActivity, RiskLevel = RiskLevel.High, IpAddress = "10.0.0.55", Country = "US", DeviceId = "unknown", DetailsJson = "{\"reason\": \"Multiple sensitive operations in short time\"}", CreatedAt = DateTime.UtcNow.AddMinutes(-30) }
        };

        context.RiskEvents.AddRange(events);
        logger.LogInformation("Created {Count} risk events", events.Count);
    }

    private static async Task SeedAdaptivePoliciesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AdaptivePolicies.AnyAsync(p => p.TenantId == TestTenantId)) return;

        var policies = new List<AdaptivePolicyEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "High Risk Block", Description = "Block access when risk score exceeds threshold", Conditions = "{\"riskScore\": {\"operator\": \">\", \"value\": 80}}", ActionsJson = "[3, 5]", RiskThreshold = 80, IsEnabled = true, Priority = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "MFA Step-Up", Description = "Require MFA for medium risk", Conditions = "{\"riskScore\": {\"operator\": \">\", \"value\": 50}}", ActionsJson = "[1]", RiskThreshold = 50, IsEnabled = true, Priority = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Geo Restriction", Description = "Block access from restricted countries", Conditions = "{\"country\": {\"operator\": \"in\", \"value\": [\"CN\", \"RU\", \"KP\"]}}", ActionsJson = "[2, 5]", RiskThreshold = 0, IsEnabled = true, Priority = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.AdaptivePolicies.AddRange(policies);
        logger.LogInformation("Created {Count} adaptive policies", policies.Count);
    }

    #endregion

    #region Privileged Access

    private static async Task SeedJitGrantsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.JitGrants.AnyAsync(j => j.TenantId == TestTenantId)) return;

        var grants = new List<JitGrantEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, UserId = TestTenantUserId, RoleId = Guid.NewGuid(), RoleName = "Database Admin", GrantedAt = DateTime.UtcNow.AddHours(-2), ExpiresAt = DateTime.UtcNow.AddHours(6), ApprovedBy = TestAdminUserId, Status = 1, Justification = "Emergency database maintenance" },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, UserId = TestAdminUserId, RoleId = Guid.NewGuid(), RoleName = "Super Admin", GrantedAt = DateTime.UtcNow.AddDays(-1), ExpiresAt = DateTime.UtcNow.AddHours(-12), ApprovedBy = TestAdminUserId, Status = 2, Justification = "Security incident response" }
        };

        context.JitGrants.AddRange(grants);
        logger.LogInformation("Created {Count} JIT grants", grants.Count);
    }

    private static async Task SeedBreakGlassAccountsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.BreakGlassAccounts.AnyAsync()) return;

        var accounts = new List<BreakGlassAccountEntity>
        {
            new() { Id = Guid.NewGuid(), Username = "emergency-admin-1", PasswordHash = "$2a$11$breakglasspasswordhash1", IsEnabled = true, AllowedTenantsJson = "[\"11111111-1111-1111-1111-111111111111\"]", AllowedRolesJson = "[\"SuperAdmin\"]", LastUsedAt = null, CreatedAt = DateTime.UtcNow.AddDays(-90) },
            new() { Id = Guid.NewGuid(), Username = "emergency-admin-2", PasswordHash = "$2a$11$breakglasspasswordhash2", IsEnabled = true, AllowedTenantsJson = "[\"*\"]", AllowedRolesJson = "[\"GlobalAdmin\"]", LastUsedAt = DateTime.UtcNow.AddDays(-30), CreatedAt = DateTime.UtcNow.AddDays(-180) }
        };

        context.BreakGlassAccounts.AddRange(accounts);
        logger.LogInformation("Created {Count} break glass accounts", accounts.Count);
    }

    #endregion

    #region Governance

    private static async Task SeedAccessPackagesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AccessPackages.AnyAsync(a => a.Id == TestAccessPackageId)) return;

        var packages = new List<AccessPackageEntity>
        {
            new() { Id = TestAccessPackageId, TenantId = TestTenantId, Name = "Developer Access", Description = "Standard developer access to dev resources", RoleIdsJson = "[\"developer\", \"devops-viewer\"]", ApplicationIdsJson = "[\"77777777-7777-7777-7777-777777777777\"]", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Manager Access", Description = "Manager access with team management", RoleIdsJson = "[\"manager\", \"team-admin\"]", ApplicationIdsJson = "[]", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Finance Access", Description = "Finance department access", RoleIdsJson = "[\"finance-viewer\", \"report-generator\"]", ApplicationIdsJson = "[]", IsEnabled = true, CreatedAt = DateTime.UtcNow }
        };

        context.AccessPackages.AddRange(packages);
        logger.LogInformation("Created {Count} access packages", packages.Count);
    }

    private static async Task SeedAccessRequestsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AccessRequests.AnyAsync(a => a.TenantId == TestTenantId)) return;

        var requests = new List<AccessRequestEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, RequesterId = TestTenantUserId, RequesterName = "Test User", Status = 0, Justification = "Need access to admin dashboard for Q4 reporting", CreatedAt = DateTime.UtcNow.AddDays(-2) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, RequesterId = TestTenantUserId, RequesterName = "Test User", Status = 1, Justification = "Required for project deployment", CreatedAt = DateTime.UtcNow.AddDays(-5), ReviewedAt = DateTime.UtcNow.AddDays(-4), ReviewedBy = TestAdminUserId, ReviewComment = "Approved for deployment phase" },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, RequesterId = TestTenantUserId, RequesterName = "Test User", Status = 2, Justification = "Need database admin access", CreatedAt = DateTime.UtcNow.AddDays(-10), ReviewedAt = DateTime.UtcNow.AddDays(-9), ReviewedBy = TestAdminUserId, ReviewComment = "Database access requires manager approval" },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, RequesterId = Guid.Parse("44444444-4444-4444-4444-444444444445"), RequesterName = "Manager User", Status = 0, Justification = "Requesting elevated privileges for audit", CreatedAt = DateTime.UtcNow.AddHours(-6) }
        };

        context.AccessRequests.AddRange(requests);
        logger.LogInformation("Created {Count} access requests", requests.Count);
    }

    private static async Task SeedChangeSetsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.ChangeSets.AnyAsync(c => c.ScopeId == TestTenantId)) return;

        var changeSets = new List<ChangeSetEntity>
        {
            new() { Id = Guid.NewGuid(), ScopeType = "Tenant", ScopeId = TestTenantId, Title = "Update Security Policy", Description = "Enable MFA for all admins", Category = 1, Status = 0, RequestedByUserId = TestAdminUserId, CreatedAt = DateTimeOffset.UtcNow.AddDays(-1) },
            new() { Id = Guid.NewGuid(), ScopeType = "Tenant", ScopeId = TestTenantId, Title = "Add New Application", Description = "Register new CRM application", Category = 2, Status = 1, RequestedByUserId = TestAdminUserId, CreatedAt = DateTimeOffset.UtcNow.AddDays(-3), ApprovedByUserId = TestAdminUserId, ApprovedAt = DateTimeOffset.UtcNow.AddDays(-2), AppliedAt = DateTimeOffset.UtcNow.AddDays(-2) },
            new() { Id = Guid.NewGuid(), ScopeType = "Tenant", ScopeId = TestTenantId, Title = "Modify OrgUnit Structure", Description = "Add new Sales department", Category = 3, Status = 2, RequestedByUserId = TestTenantUserId, CreatedAt = DateTimeOffset.UtcNow.AddDays(-5), ApprovedByUserId = TestAdminUserId, ApprovedAt = DateTimeOffset.UtcNow.AddDays(-4), RolledBackAt = DateTimeOffset.UtcNow.AddDays(-3), RollbackReason = "Incorrect department hierarchy" }
        };

        context.ChangeSets.AddRange(changeSets);
        logger.LogInformation("Created {Count} change sets", changeSets.Count);
    }

    #endregion

    #region Integration

    private static async Task SeedServiceAccountsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Set<ServiceAccountEntity>().AnyAsync(s => s.Id == TestServiceAccountId)) return;

        var accounts = new List<ServiceAccountEntity>
        {
            new() { Id = TestServiceAccountId, TenantId = TestTenantId, Name = "CI/CD Pipeline", Description = "Service account for CI/CD automation", Email = "ci-cd@test.local", Status = ServiceAccountStatus.Active, RolesJson = "[\"api:read\", \"api:write\", \"deploy:create\"]", CreatedAt = DateTime.UtcNow.AddDays(-30), LastAccessAt = DateTime.UtcNow.AddHours(-2), CreatedByUserId = TestAdminUserId },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Backup Service", Description = "Service account for automated backups", Email = "backup@test.local", Status = ServiceAccountStatus.Active, RolesJson = "[\"backup:read\", \"backup:write\"]", CreatedAt = DateTime.UtcNow.AddDays(-20), LastAccessAt = DateTime.UtcNow.AddHours(-12), CreatedByUserId = TestAdminUserId },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Monitoring Agent", Description = "Service account for health monitoring", Email = "monitor@test.local", Status = ServiceAccountStatus.Active, RolesJson = "[\"monitor:read\"]", CreatedAt = DateTime.UtcNow.AddDays(-10), LastAccessAt = DateTime.UtcNow.AddMinutes(-5), CreatedByUserId = TestAdminUserId },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Legacy Integration", Description = "Legacy system integration (disabled)", Email = "legacy@test.local", Status = ServiceAccountStatus.Disabled, RolesJson = "[\"legacy:all\"]", CreatedAt = DateTime.UtcNow.AddDays(-90), LastAccessAt = DateTime.UtcNow.AddDays(-30), CreatedByUserId = TestAdminUserId }
        };

        context.Set<ServiceAccountEntity>().AddRange(accounts);
        logger.LogInformation("Created {Count} service accounts", accounts.Count);
    }

    private static async Task SeedApiKeysAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Set<ApiKeyEntity>().AnyAsync(a => a.Id == TestApiKeyId)) return;

        var keys = new List<ApiKeyEntity>
        {
            new() { Id = TestApiKeyId, TenantId = TestTenantId, ServiceAccountId = TestServiceAccountId, Name = "CI/CD Deploy Key", Description = "API key for deployment automation", KeyHash = "sha256_test_hash_ci", KeyPrefix = "osk_ci", Status = ApiKeyStatus.Active, ScopesJson = "[\"deploy:create\", \"deploy:read\"]", CreatedAt = DateTime.UtcNow.AddDays(-30), ExpiresAt = DateTime.UtcNow.AddDays(335), LastUsedAt = DateTime.UtcNow.AddHours(-1) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ServiceAccountId = TestServiceAccountId, Name = "Read-Only Key", Description = "Read-only API key for reporting", KeyHash = "sha256_test_hash_ro", KeyPrefix = "osk_ro", Status = ApiKeyStatus.Active, ScopesJson = "[\"api:read\"]", CreatedAt = DateTime.UtcNow.AddDays(-15), ExpiresAt = DateTime.UtcNow.AddDays(350), LastUsedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ServiceAccountId = null, Name = "Expired Test Key", Description = "An expired API key", KeyHash = "sha256_expired", KeyPrefix = "osk_ex", Status = ApiKeyStatus.Expired, ScopesJson = "[\"test:all\"]", CreatedAt = DateTime.UtcNow.AddDays(-100), ExpiresAt = DateTime.UtcNow.AddDays(-10), LastUsedAt = DateTime.UtcNow.AddDays(-15) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ServiceAccountId = null, Name = "Revoked Key", Description = "Manually revoked API key", KeyHash = "sha256_revoked", KeyPrefix = "osk_rv", Status = ApiKeyStatus.Revoked, ScopesJson = "[\"admin:all\"]", CreatedAt = DateTime.UtcNow.AddDays(-60), RevokedAt = DateTime.UtcNow.AddDays(-5), RevokedReason = "Security policy violation" }
        };

        context.Set<ApiKeyEntity>().AddRange(keys);
        logger.LogInformation("Created {Count} API keys", keys.Count);
    }

    private static async Task SeedWebhookSubscriptionsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.WebhookSubscriptions.AnyAsync(w => w.TenantId == TestTenantId)) return;

        var webhooks = new List<WebhookSubscriptionEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "Slack Notifications", EndpointUrl = "https://hooks.slack.com/services/xxx", Secret = "webhook_secret_1", EventTypesJson = "[\"user.login\", \"user.logout\", \"security.risk\"]", IsEnabled = true, MaxRetries = 3, CreatedAt = DateTime.UtcNow.AddDays(-30), LastDeliveryAt = DateTime.UtcNow.AddHours(-1), LastDeliveryStatus = "success" },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "SIEM Integration", EndpointUrl = "https://siem.company.com/webhook", Secret = "webhook_secret_2", EventTypesJson = "[\"security.*\", \"audit.*\"]", IsEnabled = true, MaxRetries = 5, CreatedAt = DateTime.UtcNow.AddDays(-60), LastDeliveryAt = DateTime.UtcNow.AddMinutes(-30), LastDeliveryStatus = "success" },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Name = "HR System Sync", EndpointUrl = "https://hr.company.com/api/webhook", Secret = "webhook_secret_3", EventTypesJson = "[\"user.created\", \"user.updated\", \"user.deleted\"]", IsEnabled = false, MaxRetries = 3, CreatedAt = DateTime.UtcNow.AddDays(-45), LastDeliveryAt = DateTime.UtcNow.AddDays(-10), LastDeliveryStatus = "failed" }
        };

        context.WebhookSubscriptions.AddRange(webhooks);
        logger.LogInformation("Created {Count} webhook subscriptions", webhooks.Count);
    }

    #endregion

    #region Notifications

    private static async Task SeedNotificationTemplatesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.NotificationTemplates.AnyAsync(n => n.TenantId == TestTenantId)) return;

        var templates = new List<NotificationTemplateEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "welcome-email", Name = "Welcome Email", Category = 1, Channel = 1, Locale = "en", SubjectTemplate = "Welcome to {{TenantName}}!", BodyTemplate = "Hello {{UserName}},\n\nWelcome to {{TenantName}}! Your account has been created.\n\nBest,\nThe Team", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "password-reset", Name = "Password Reset", Category = 2, Channel = 1, Locale = "en", SubjectTemplate = "Reset Your Password", BodyTemplate = "Hello {{UserName}},\n\nClick the link to reset: {{ResetLink}}\n\nExpires in 24 hours.", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "mfa-enrolled", Name = "MFA Enabled", Category = 2, Channel = 1, Locale = "en", SubjectTemplate = "MFA Has Been Enabled", BodyTemplate = "Hello {{UserName}},\n\nMFA has been enabled on your account.\n\nIf this wasn't you, contact support.", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "login-alert", Name = "New Login Alert", Category = 3, Channel = 1, Locale = "en", SubjectTemplate = "New Login Detected", BodyTemplate = "Hello {{UserName}},\n\nNew login detected:\nDevice: {{DeviceName}}\nLocation: {{Location}}\nTime: {{LoginTime}}", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "access-approved", Name = "Access Request Approved", Category = 4, Channel = 1, Locale = "en", SubjectTemplate = "Your Access Request Has Been Approved", BodyTemplate = "Hello {{UserName}},\n\nYour request for {{ResourceName}} has been approved.\n\nApproved by: {{ApproverName}}", IsEnabled = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, TemplateKey = "access-denied", Name = "Access Request Denied", Category = 4, Channel = 1, Locale = "en", SubjectTemplate = "Your Access Request Has Been Denied", BodyTemplate = "Hello {{UserName}},\n\nYour request for {{ResourceName}} has been denied.\n\nReason: {{DenialReason}}", IsEnabled = true, CreatedAt = DateTime.UtcNow }
        };

        context.NotificationTemplates.AddRange(templates);
        logger.LogInformation("Created {Count} notification templates", templates.Count);
    }

    private static async Task SeedNotificationChannelConfigsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.NotificationChannelConfigs.AnyAsync(c => c.TenantId == TestTenantId)) return;

        var configs = new List<NotificationChannelConfigEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Channel = 1, IsEnabled = true, ConfigurationJson = "{\"smtpHost\": \"smtp.test.local\", \"smtpPort\": 587}", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Channel = 2, IsEnabled = false, ConfigurationJson = "{\"provider\": \"twilio\", \"accountSid\": \"xxx\"}", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, Channel = 3, IsEnabled = true, ConfigurationJson = "{\"provider\": \"firebase\", \"projectId\": \"xxx\"}", CreatedAt = DateTime.UtcNow }
        };

        context.NotificationChannelConfigs.AddRange(configs);
        logger.LogInformation("Created {Count} notification channel configs", configs.Count);
    }

    #endregion

    #region Audit

    private static async Task SeedAuditEventsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AuditEvents.AnyAsync(a => a.TenantId == TestTenantId)) return;

        var events = new List<AuditEventEntity>
        {
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.UserLogin, Description = "Admin logged in successfully", IpAddress = "192.168.1.100", UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", CreatedAt = DateTime.UtcNow.AddHours(-24) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.UserCreated, Description = "Created user: user@test.local", IpAddress = "192.168.1.100", CreatedAt = DateTime.UtcNow.AddHours(-23) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.ApplicationCreated, Description = "Created application: Test Web Application", IpAddress = "192.168.1.100", CreatedAt = DateTime.UtcNow.AddHours(-22) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestTenantUserId, EventType = AuditEventType.UserLogin, Description = "User logged in successfully", IpAddress = "192.168.1.101", CreatedAt = DateTime.UtcNow.AddHours(-12) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestTenantUserId, EventType = AuditEventType.PasswordChanged, Description = "User changed their password", IpAddress = "192.168.1.101", CreatedAt = DateTime.UtcNow.AddHours(-6) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = null, EventType = AuditEventType.FailedLoginAttempt, Description = "Failed login attempt for user@test.local", IpAddress = "203.0.113.50", CreatedAt = DateTime.UtcNow.AddHours(-3) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = null, EventType = AuditEventType.FailedLoginAttempt, Description = "Failed login attempt - invalid password", IpAddress = "203.0.113.51", CreatedAt = DateTime.UtcNow.AddHours(-2) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.OrgUnitCreated, Description = "Created org unit: IT Department", IpAddress = "192.168.1.100", CreatedAt = DateTime.UtcNow.AddHours(-1) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.ApiKeyCreated, Description = "Created API key: CI/CD Deploy Key", IpAddress = "192.168.1.100", CreatedAt = DateTime.UtcNow.AddMinutes(-30) },
            new() { Id = Guid.NewGuid(), TenantId = TestTenantId, ActorId = TestAdminUserId, EventType = AuditEventType.ConfigurationChanged, Description = "Updated security policy settings", IpAddress = "192.168.1.100", CreatedAt = DateTime.UtcNow.AddMinutes(-15) }
        };

        context.AuditEvents.AddRange(events);
        logger.LogInformation("Created {Count} audit events", events.Count);
    }

    #endregion

    #region Platform

    private static async Task SeedPlatformVersionAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.PlatformVersions.AnyAsync()) return;

        var versions = new List<PlatformVersionEntity>
        {
            new() { Id = Guid.NewGuid(), Version = "0.9.0", Description = "Beta Release", ReleaseNotes = "Initial beta with core features.", ReleaseDate = DateTime.UtcNow.AddMonths(-3), IsCurrentVersion = false, CreatedAt = DateTime.UtcNow.AddMonths(-3) },
            new() { Id = Guid.NewGuid(), Version = "1.0.0", Description = "Initial Stable Release", ReleaseNotes = "First stable release with identity management.", ReleaseDate = DateTime.UtcNow.AddMonths(-1), IsCurrentVersion = false, CreatedAt = DateTime.UtcNow.AddMonths(-1) },
            new() { Id = Guid.NewGuid(), Version = "1.1.0", Description = "Current Release", ReleaseNotes = "Added MFA, adaptive security, and webhooks.", ReleaseDate = DateTime.UtcNow, IsCurrentVersion = true, CreatedAt = DateTime.UtcNow }
        };

        context.PlatformVersions.AddRange(versions);
        logger.LogInformation("Created {Count} platform versions", versions.Count);
    }

    #endregion
}
