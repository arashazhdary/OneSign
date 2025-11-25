using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Api.Data;

/// <summary>
/// Seeds the database with test data for development
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

    public static async Task SeedAsync(OnesignDbContext context, ILogger logger)
    {
        logger.LogInformation("Starting database seeding...");

        try
        {
            // Core entities
            await SeedRegionAsync(context, logger);
            await SeedTenantAsync(context, logger);
            await SeedGlobalUserAsync(context, logger);
            await SeedTenantUsersAsync(context, logger);
            await SeedOrgUnitsAsync(context, logger);
            await SeedApplicationsAsync(context, logger);
            await SeedSecurityPoliciesAsync(context, logger);
            await SeedPlatformVersionAsync(context, logger);

            // Additional entities for comprehensive testing
            await SeedAuditEventsAsync(context, logger);
            await SeedTrustedDevicesAsync(context, logger);
            await SeedRiskEventsAsync(context, logger);
            await SeedNotificationTemplatesAsync(context, logger);
            await SeedServiceAccountsAsync(context, logger);
            await SeedApiKeysAsync(context, logger);
            await SeedAccessRequestsAsync(context, logger);

            await context.SaveChangesAsync();
            logger.LogInformation("Database seeding completed successfully!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database seeding");
            throw;
        }
    }

    private static async Task SeedRegionAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Regions.AnyAsync(r => r.Id == TestRegionId))
        {
            logger.LogInformation("Region already exists, skipping...");
            return;
        }

        var region = new RegionEntity
        {
            Id = TestRegionId,
            DisplayName = "Default Region",
            IsActive = true,
            EndpointBaseUrl = "http://localhost:7000",
            DbClusterRef = "local",
            StorageClusterRef = "local",
            Status = 1,
            CreatedAt = DateTime.UtcNow
        };

        context.Regions.Add(region);
        logger.LogInformation("Created test region: {RegionName}", region.DisplayName);
    }

    private static async Task SeedTenantAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Tenants.AnyAsync(t => t.Id == TestTenantId))
        {
            logger.LogInformation("Tenant already exists, skipping...");
            return;
        }

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

        var dataResidency = new TenantDataResidencyEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            DataRegionId = TestRegionId,
            BackupRegionId = TestRegionId,
            ComplianceTag = "GDPR",
            CrossRegionReplicationAllowed = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.TenantDataResidencies.Add(dataResidency);
        logger.LogInformation("Created test tenant: {TenantName}", tenant.Name);
    }

    private static async Task SeedGlobalUserAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.GlobalUsers.AnyAsync(u => u.Id == TestGlobalUserId))
        {
            logger.LogInformation("Global user already exists, skipping...");
            return;
        }

        var globalUser = new GlobalUserEntity
        {
            Id = TestGlobalUserId,
            Email = "admin@test.local",
            PasswordHash = "$2a$11$testpasswordhashfortestingonly",
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.GlobalUsers.Add(globalUser);
        logger.LogInformation("Created global user: {Email}", globalUser.Email);
    }

    private static async Task SeedTenantUsersAsync(OnesignDbContext context, ILogger logger)
    {
        if (!await context.TenantUsers.AnyAsync(u => u.Id == TestAdminUserId))
        {
            var adminUser = new TenantUserEntity
            {
                Id = TestAdminUserId,
                TenantId = TestTenantId,
                GlobalUserId = TestGlobalUserId,
                IsAdmin = true,
                IsActive = true,
                Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active,
                IsLocked = false,
                RequireMfaNextSignIn = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.TenantUsers.Add(adminUser);
            logger.LogInformation("Created admin tenant user");
        }

        if (!await context.TenantUsers.AnyAsync(u => u.Id == TestTenantUserId))
        {
            var regularGlobalUserId = Guid.Parse("22222222-2222-2222-2222-222222222223");
            if (!await context.GlobalUsers.AnyAsync(u => u.Id == regularGlobalUserId))
            {
                var regularGlobalUser = new GlobalUserEntity
                {
                    Id = regularGlobalUserId,
                    Email = "user@test.local",
                    PasswordHash = "$2a$11$testpasswordhashfortestingonly",
                    EmailVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.GlobalUsers.Add(regularGlobalUser);
            }

            var regularUser = new TenantUserEntity
            {
                Id = TestTenantUserId,
                TenantId = TestTenantId,
                GlobalUserId = regularGlobalUserId,
                IsAdmin = false,
                IsActive = true,
                Status = Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active,
                IsLocked = false,
                RequireMfaNextSignIn = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.TenantUsers.Add(regularUser);
            logger.LogInformation("Created regular tenant user");
        }
    }

    private static async Task SeedOrgUnitsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.OrgUnits.AnyAsync(o => o.Id == TestOrgUnitId))
        {
            logger.LogInformation("OrgUnit already exists, skipping...");
            return;
        }

        var rootOrgUnit = new OrgUnitEntity
        {
            Id = TestOrgUnitId,
            TenantId = TestTenantId,
            Name = "Headquarters",
            Code = "HQ",
            ParentId = null,
            Path = "/HQ",
            Level = 0,
            SortOrder = 0,
            Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.OrgUnits.Add(rootOrgUnit);

        var itDept = new OrgUnitEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            Name = "IT Department",
            Code = "IT",
            ParentId = TestOrgUnitId,
            Path = "/HQ/IT",
            Level = 1,
            SortOrder = 1,
            Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var hrDept = new OrgUnitEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            Name = "Human Resources",
            Code = "HR",
            ParentId = TestOrgUnitId,
            Path = "/HQ/HR",
            Level = 1,
            SortOrder = 2,
            Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var financeDept = new OrgUnitEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            Name = "Finance",
            Code = "FIN",
            ParentId = TestOrgUnitId,
            Path = "/HQ/FIN",
            Level = 1,
            SortOrder = 3,
            Status = Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.OrgUnits.AddRange(itDept, hrDept, financeDept);
        logger.LogInformation("Created OrgUnit hierarchy");
    }

    private static async Task SeedApplicationsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.ApplicationClients.AnyAsync(a => a.Id == TestApplicationId))
        {
            logger.LogInformation("Application already exists, skipping...");
            return;
        }

        var webApp = new ApplicationClientEntity
        {
            Id = TestApplicationId,
            TenantId = TestTenantId,
            Name = "Test Web Application",
            ClientId = "test-web-app",
            ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.Web,
            GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var mobileApp = new ApplicationClientEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            Name = "Test Mobile Application",
            ClientId = "test-mobile-app",
            ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.Mobile,
            GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var spaApp = new ApplicationClientEntity
        {
            Id = Guid.NewGuid(),
            TenantId = TestTenantId,
            Name = "Admin Portal SPA",
            ClientId = "admin-portal-spa",
            ApplicationType = Onesign.Modules.Applications.Domain.Enums.ApplicationType.SPA,
            GrantType = Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.ApplicationClients.AddRange(webApp, mobileApp, spaApp);
        logger.LogInformation("Created test applications");
    }

    private static async Task SeedSecurityPoliciesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.SecurityPolicies.AnyAsync(p => p.TenantId == TestTenantId))
        {
            logger.LogInformation("Security policy already exists, skipping...");
            return;
        }

        var policy = new SecurityPolicyEntity
        {
            TenantId = TestTenantId,
            MfaRequirementLevel = MfaRequirementLevel.None,
            AllowMfaRememberDevice = true,
            RememberDeviceDays = 30,
            RequireMfaForSensitiveApps = false,
            MaxFailedLoginAttempts = 5,
            EnableGeoAnomalyDetection = false,
            BlockLevel = RiskLevel.High,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.SecurityPolicies.Add(policy);
        logger.LogInformation("Created default security policy");
    }

    private static async Task SeedPlatformVersionAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.PlatformVersions.AnyAsync())
        {
            logger.LogInformation("Platform version already exists, skipping...");
            return;
        }

        var version = new PlatformVersionEntity
        {
            Id = Guid.NewGuid(),
            Version = "1.0.0",
            Description = "Initial release of OneSign Platform",
            ReleaseNotes = "First stable release with core identity management features.",
            ReleaseDate = DateTime.UtcNow,
            IsCurrentVersion = true,
            CreatedAt = DateTime.UtcNow
        };

        context.PlatformVersions.Add(version);
        logger.LogInformation("Created platform version: {Version}", version.Version);
    }

    private static async Task SeedAuditEventsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AuditEvents.AnyAsync(a => a.TenantId == TestTenantId))
        {
            logger.LogInformation("Audit events already exist, skipping...");
            return;
        }

        var auditEvents = new List<AuditEventEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ActorId = TestAdminUserId,
                EventType = AuditEventType.UserLogin,
                Description = "Admin user logged in successfully",
                IpAddress = "192.168.1.100",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ActorId = TestAdminUserId,
                EventType = AuditEventType.UserCreated,
                Description = "New user created: user@test.local",
                IpAddress = "192.168.1.100",
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ActorId = TestAdminUserId,
                EventType = AuditEventType.ApplicationCreated,
                Description = "New application created: Test Web Application",
                IpAddress = "192.168.1.100",
                CreatedAt = DateTime.UtcNow.AddMinutes(-30)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ActorId = TestTenantUserId,
                EventType = AuditEventType.PasswordChanged,
                Description = "User changed their password",
                IpAddress = "192.168.1.101",
                CreatedAt = DateTime.UtcNow.AddMinutes(-15)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ActorId = null,
                EventType = AuditEventType.FailedLoginAttempt,
                Description = "Failed login attempt from unknown IP",
                IpAddress = "203.0.113.50",
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            }
        };

        context.AuditEvents.AddRange(auditEvents);
        logger.LogInformation("Created {Count} audit events", auditEvents.Count);
    }

    private static async Task SeedTrustedDevicesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.TrustedDevices.AnyAsync(d => d.TenantUserId == TestAdminUserId))
        {
            logger.LogInformation("Trusted devices already exist, skipping...");
            return;
        }

        var devices = new List<TrustedDeviceEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantUserId = TestAdminUserId,
                DeviceId = "dev-laptop-001",
                DeviceName = "Admin's Work Laptop",
                FirstSeenAt = DateTime.UtcNow.AddDays(-30),
                LastSeenAt = DateTime.UtcNow.AddHours(-1),
                ExpiresAt = DateTime.UtcNow.AddDays(60),
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantUserId = TestAdminUserId,
                DeviceId = "dev-phone-001",
                DeviceName = "Admin's Mobile Phone",
                FirstSeenAt = DateTime.UtcNow.AddDays(-15),
                LastSeenAt = DateTime.UtcNow.AddHours(-3),
                ExpiresAt = DateTime.UtcNow.AddDays(45),
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantUserId = TestTenantUserId,
                DeviceId = "dev-desktop-002",
                DeviceName = "User's Desktop",
                FirstSeenAt = DateTime.UtcNow.AddDays(-7),
                LastSeenAt = DateTime.UtcNow.AddHours(-5),
                ExpiresAt = DateTime.UtcNow.AddDays(23),
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            }
        };

        context.TrustedDevices.AddRange(devices);
        logger.LogInformation("Created {Count} trusted devices", devices.Count);
    }

    private static async Task SeedRiskEventsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.RiskEvents.AnyAsync(r => r.TenantId == TestTenantId))
        {
            logger.LogInformation("Risk events already exist, skipping...");
            return;
        }

        var riskEvents = new List<RiskEventEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TenantUserId = TestTenantUserId,
                EventType = RiskEventType.NewDeviceLogin,
                RiskLevel = RiskLevel.Low,
                IpAddress = "192.168.1.150",
                Country = "US",
                DeviceId = "new-device-xyz",
                DetailsJson = "{\"browser\": \"Chrome\", \"os\": \"Windows 11\"}",
                CreatedAt = DateTime.UtcNow.AddHours(-12)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TenantUserId = TestTenantUserId,
                EventType = RiskEventType.MultipleFailedLogins,
                RiskLevel = RiskLevel.Medium,
                IpAddress = "203.0.113.50",
                Country = "CN",
                DeviceId = "unknown",
                DetailsJson = "{\"attempts\": 5, \"timeWindow\": \"5 minutes\"}",
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TenantUserId = TestAdminUserId,
                EventType = RiskEventType.GeoAnomaly,
                RiskLevel = RiskLevel.High,
                IpAddress = "198.51.100.25",
                Country = "RU",
                DeviceId = "dev-laptop-001",
                DetailsJson = "{\"previousCountry\": \"US\", \"timeSinceLastLogin\": \"2 hours\"}",
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            }
        };

        context.RiskEvents.AddRange(riskEvents);
        logger.LogInformation("Created {Count} risk events", riskEvents.Count);
    }

    private static async Task SeedNotificationTemplatesAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.NotificationTemplates.AnyAsync(n => n.TenantId == TestTenantId))
        {
            logger.LogInformation("Notification templates already exist, skipping...");
            return;
        }

        var templates = new List<NotificationTemplateEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TemplateKey = "welcome-email",
                Name = "Welcome Email",
                Category = 1,
                Channel = 1,
                Locale = "en",
                SubjectTemplate = "Welcome to {{TenantName}}!",
                BodyTemplate = "Hello {{UserName}},\n\nWelcome to {{TenantName}}! Your account has been created successfully.\n\nBest regards,\nThe {{TenantName}} Team",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TemplateKey = "password-reset",
                Name = "Password Reset",
                Category = 2,
                Channel = 1,
                Locale = "en",
                SubjectTemplate = "Reset Your Password",
                BodyTemplate = "Hello {{UserName}},\n\nClick the link below to reset your password:\n{{ResetLink}}\n\nThis link expires in 24 hours.",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TemplateKey = "mfa-enrolled",
                Name = "MFA Enrolled",
                Category = 2,
                Channel = 1,
                Locale = "en",
                SubjectTemplate = "Multi-Factor Authentication Enabled",
                BodyTemplate = "Hello {{UserName}},\n\nMFA has been successfully enabled on your account.\n\nIf you did not make this change, please contact support immediately.",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                TemplateKey = "login-alert",
                Name = "New Login Alert",
                Category = 3,
                Channel = 1,
                Locale = "en",
                SubjectTemplate = "New Login to Your Account",
                BodyTemplate = "Hello {{UserName}},\n\nA new login was detected on your account:\n\nDevice: {{DeviceName}}\nLocation: {{Location}}\nTime: {{LoginTime}}\n\nIf this wasn't you, please secure your account.",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.NotificationTemplates.AddRange(templates);
        logger.LogInformation("Created {Count} notification templates", templates.Count);
    }

    private static async Task SeedServiceAccountsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Set<ServiceAccountEntity>().AnyAsync(s => s.Id == TestServiceAccountId))
        {
            logger.LogInformation("Service accounts already exist, skipping...");
            return;
        }

        var serviceAccounts = new List<ServiceAccountEntity>
        {
            new()
            {
                Id = TestServiceAccountId,
                TenantId = TestTenantId,
                Name = "CI/CD Pipeline",
                Description = "Service account for CI/CD automation",
                Email = "ci-cd@test.local",
                Status = ServiceAccountStatus.Active,
                RolesJson = "[\"api:read\", \"api:write\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                LastAccessAt = DateTime.UtcNow.AddHours(-2),
                CreatedByUserId = TestAdminUserId
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                Name = "Backup Service",
                Description = "Service account for automated backups",
                Email = "backup@test.local",
                Status = ServiceAccountStatus.Active,
                RolesJson = "[\"backup:read\", \"backup:write\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                LastAccessAt = DateTime.UtcNow.AddHours(-12),
                CreatedByUserId = TestAdminUserId
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                Name = "Monitoring Agent",
                Description = "Service account for health monitoring",
                Email = "monitor@test.local",
                Status = ServiceAccountStatus.Active,
                RolesJson = "[\"monitor:read\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                LastAccessAt = DateTime.UtcNow.AddMinutes(-5),
                CreatedByUserId = TestAdminUserId
            }
        };

        context.Set<ServiceAccountEntity>().AddRange(serviceAccounts);
        logger.LogInformation("Created {Count} service accounts", serviceAccounts.Count);
    }

    private static async Task SeedApiKeysAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.Set<ApiKeyEntity>().AnyAsync(a => a.Id == TestApiKeyId))
        {
            logger.LogInformation("API keys already exist, skipping...");
            return;
        }

        var apiKeys = new List<ApiKeyEntity>
        {
            new()
            {
                Id = TestApiKeyId,
                TenantId = TestTenantId,
                ServiceAccountId = TestServiceAccountId,
                Name = "CI/CD Deploy Key",
                Description = "API key for deployment automation",
                KeyHash = "sha256_test_hash_placeholder_for_dev",
                KeyPrefix = "osk_ci",
                Status = ApiKeyStatus.Active,
                ScopesJson = "[\"deploy:create\", \"deploy:read\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                ExpiresAt = DateTime.UtcNow.AddDays(335),
                LastUsedAt = DateTime.UtcNow.AddHours(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ServiceAccountId = TestServiceAccountId,
                Name = "Read-Only Key",
                Description = "Read-only API key for reporting",
                KeyHash = "sha256_test_hash_placeholder_readonly",
                KeyPrefix = "osk_ro",
                Status = ApiKeyStatus.Active,
                ScopesJson = "[\"api:read\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                ExpiresAt = DateTime.UtcNow.AddDays(350),
                LastUsedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                ServiceAccountId = null,
                Name = "Expired Test Key",
                Description = "An expired API key for testing",
                KeyHash = "sha256_expired_test_hash",
                KeyPrefix = "osk_ex",
                Status = ApiKeyStatus.Expired,
                ScopesJson = "[\"test:all\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-100),
                ExpiresAt = DateTime.UtcNow.AddDays(-10),
                LastUsedAt = DateTime.UtcNow.AddDays(-15)
            }
        };

        context.Set<ApiKeyEntity>().AddRange(apiKeys);
        logger.LogInformation("Created {Count} API keys", apiKeys.Count);
    }

    private static async Task SeedAccessRequestsAsync(OnesignDbContext context, ILogger logger)
    {
        if (await context.AccessRequests.AnyAsync(a => a.TenantId == TestTenantId))
        {
            logger.LogInformation("Access requests already exist, skipping...");
            return;
        }

        var accessRequests = new List<AccessRequestEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                RequesterId = TestTenantUserId,
                RequesterName = "Test User",
                Status = 0, // Pending
                Justification = "Need access to admin dashboard for Q4 reporting",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                RequesterId = TestTenantUserId,
                RequesterName = "Test User",
                Status = 1, // Approved
                Justification = "Required for project deployment",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                ReviewedAt = DateTime.UtcNow.AddDays(-4),
                ReviewedBy = TestAdminUserId,
                ReviewComment = "Approved for deployment phase"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                RequesterId = TestTenantUserId,
                RequesterName = "Test User",
                Status = 2, // Rejected
                Justification = "Need database admin access",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                ReviewedAt = DateTime.UtcNow.AddDays(-9),
                ReviewedBy = TestAdminUserId,
                ReviewComment = "Database access requires manager approval"
            }
        };

        context.AccessRequests.AddRange(accessRequests);
        logger.LogInformation("Created {Count} access requests", accessRequests.Count);
    }
}
