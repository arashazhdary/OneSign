using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that generates security insights from analytics data,
/// identifying patterns, anomalies, and recommendations for each tenant.
/// </summary>
public class InsightGenerationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InsightGenerationWorker> _logger;
    private readonly IConfiguration _configuration;

    public InsightGenerationWorker(
        IServiceProvider serviceProvider,
        ILogger<InsightGenerationWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:InsightGeneration:IntervalMinutes", 60);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);

        _logger.LogInformation("InsightGenerationWorker starting with interval of {Interval} minutes", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await GenerateInsightsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in InsightGenerationWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task GenerateInsightsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get all active tenants
        var tenants = await dbContext.Tenants
            .Where(t => t.Status == Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Generating insights for {TenantCount} tenants", tenants.Count);

        var totalInsights = 0;

        foreach (var tenantId in tenants)
        {
            try
            {
                var insightCount = await GenerateTenantInsightsAsync(dbContext, tenantId, cancellationToken);
                totalInsights += insightCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights for tenant {TenantId}", tenantId);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Insight generation completed at {Time}, total insights generated: {Count}",
            DateTime.UtcNow, totalInsights);
    }

    private async Task<int> GenerateTenantInsightsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var insightCount = 0;
        var now = DateTime.UtcNow;
        var last24Hours = now.AddHours(-24);
        var last7Days = now.AddDays(-7);

        // Insight 1: Unusual login failure rate
        insightCount += await CheckLoginFailureRateAsync(dbContext, tenantId, last24Hours, cancellationToken);

        // Insight 2: Inactive users with elevated privileges
        insightCount += await CheckInactivePrivilegedUsersAsync(dbContext, tenantId, last7Days, cancellationToken);

        // Insight 3: Applications with excessive permissions
        insightCount += await CheckOverprivilegedApplicationsAsync(dbContext, tenantId, cancellationToken);

        // Insight 4: Stale access requests
        insightCount += await CheckStaleAccessRequestsAsync(dbContext, tenantId, last7Days, cancellationToken);

        // Insight 5: MFA adoption rate
        insightCount += await CheckMfaAdoptionAsync(dbContext, tenantId, cancellationToken);

        // Insight 6: Unusual administrative activity
        insightCount += await CheckUnusualAdminActivityAsync(dbContext, tenantId, last24Hours, cancellationToken);

        return insightCount;
    }

    private async Task<int> CheckLoginFailureRateAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime since,
        CancellationToken cancellationToken)
    {
        var failedLogins = await dbContext.AuditEvents
            .CountAsync(a => a.TenantId == tenantId &&
                            a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.LoginFailed &&
                            a.CreatedAt >= since, cancellationToken);

        var successfulLogins = await dbContext.AuditEvents
            .CountAsync(a => a.TenantId == tenantId &&
                            a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserLoggedIn &&
                            a.CreatedAt >= since, cancellationToken);

        var totalAttempts = failedLogins + successfulLogins;

        if (totalAttempts > 10 && failedLogins > totalAttempts * 0.3) // >30% failure rate
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.security.high_login_failures" &&
                                         i.Status == 0 &&
                                         i.CreatedAt >= since, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 1, // Security
                    Severity = failedLogins > totalAttempts * 0.5 ? 2 : 1, // High if >50%, else Medium
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"High login failure rate: {failedLogins}/{totalAttempts} attempts failed",
                    MessageKey = "insight.security.high_login_failures",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        FailedLogins = failedLogins,
                        SuccessfulLogins = successfulLogins,
                        FailureRate = (double)failedLogins / totalAttempts * 100
                    }),
                    Status = 0, // Open
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                _logger.LogInformation("Generated high login failure insight for tenant {TenantId}", tenantId);
                return 1;
            }
        }

        return 0;
    }

    private async Task<int> CheckInactivePrivilegedUsersAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime inactiveSince,
        CancellationToken cancellationToken)
    {
        // Find users with active JIT grants who haven't logged in recently
        var inactivePrivilegedUsers = await dbContext.JitGrants
            .Where(g => g.TenantId == tenantId && g.Status == 0) // Active grants
            .Join(dbContext.TenantUsers,
                g => g.UserId,
                u => u.Id,
                (g, u) => new { Grant = g, User = u })
            .Where(x => x.User.LastLoginAt == null || x.User.LastLoginAt < inactiveSince)
            .Select(x => x.User.Id)
            .Distinct()
            .CountAsync(cancellationToken);

        if (inactivePrivilegedUsers > 0)
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.security.inactive_privileged_users" &&
                                         i.Status == 0, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 1, // Security
                    Severity = inactivePrivilegedUsers > 5 ? 2 : 1,
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"{inactivePrivilegedUsers} inactive users have elevated privileges",
                    MessageKey = "insight.security.inactive_privileged_users",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        InactiveUserCount = inactivePrivilegedUsers,
                        InactiveDays = 7
                    }),
                    Status = 0,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                return 1;
            }
        }

        return 0;
    }

    private async Task<int> CheckOverprivilegedApplicationsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        // Find applications with very broad scope access
        var appsWithAllOrgUnits = await dbContext.ApplicationClients
            .Where(a => a.TenantId == tenantId)
            .Join(dbContext.ApplicationOrgUnits,
                a => a.Id,
                o => o.ApplicationClientId,
                (a, o) => new { App = a, OrgUnit = o })
            .GroupBy(x => x.App.Id)
            .Select(g => new { AppId = g.Key, OrgUnitCount = g.Count() })
            .Where(x => x.OrgUnitCount > 10)
            .CountAsync(cancellationToken);

        if (appsWithAllOrgUnits > 0)
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.security.overprivileged_apps" &&
                                         i.Status == 0, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 2, // Compliance
                    Severity = 1, // Medium
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"{appsWithAllOrgUnits} applications have access to many org units",
                    MessageKey = "insight.security.overprivileged_apps",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        OverprivilegedAppCount = appsWithAllOrgUnits
                    }),
                    Status = 0,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                return 1;
            }
        }

        return 0;
    }

    private async Task<int> CheckStaleAccessRequestsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime staleSince,
        CancellationToken cancellationToken)
    {
        // Status: 0 = Pending
        var staleRequests = await dbContext.AccessRequests
            .CountAsync(r => r.TenantId == tenantId &&
                            r.Status == 0 &&
                            r.CreatedAt < staleSince, cancellationToken);

        if (staleRequests > 0)
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.operational.stale_access_requests" &&
                                         i.Status == 0, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 3, // Operational
                    Severity = staleRequests > 10 ? 2 : 1,
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"{staleRequests} access requests pending for over 7 days",
                    MessageKey = "insight.operational.stale_access_requests",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        StaleRequestCount = staleRequests,
                        StaleDays = 7
                    }),
                    Status = 0,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                return 1;
            }
        }

        return 0;
    }

    private async Task<int> CheckMfaAdoptionAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var totalUsers = await dbContext.TenantUsers
            .CountAsync(u => u.TenantId == tenantId && u.IsActive, cancellationToken);

        var mfaEnabledUsers = await dbContext.TenantUsers
            .Where(u => u.TenantId == tenantId && u.IsActive)
            .Join(dbContext.UserMfaMethods,
                u => u.Id,
                m => m.TenantUserId,
                (u, m) => new { u, m })
            .Where(x => x.m.IsVerified)
            .Select(x => x.u.Id)
            .Distinct()
            .CountAsync(cancellationToken);

        if (totalUsers > 5 && mfaEnabledUsers < totalUsers * 0.5) // <50% MFA adoption
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.security.low_mfa_adoption" &&
                                         i.Status == 0, cancellationToken);

            if (existingInsight == null)
            {
                var adoptionRate = totalUsers > 0 ? (double)mfaEnabledUsers / totalUsers * 100 : 0;

                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 1, // Security
                    Severity = adoptionRate < 25 ? 2 : 1, // High if <25%
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"Low MFA adoption rate: {adoptionRate:F1}%",
                    MessageKey = "insight.security.low_mfa_adoption",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        TotalUsers = totalUsers,
                        MfaEnabledUsers = mfaEnabledUsers,
                        AdoptionRate = adoptionRate
                    }),
                    Status = 0,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                return 1;
            }
        }

        return 0;
    }

    private async Task<int> CheckUnusualAdminActivityAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime since,
        CancellationToken cancellationToken)
    {
        // Count admin-level events
        var adminEvents = await dbContext.AuditEvents
            .CountAsync(a => a.TenantId == tenantId &&
                            a.CreatedAt >= since &&
                            (a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserCreated ||
                             a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserDeleted ||
                             a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged), cancellationToken);

        // Get typical daily average (simplified - in production would use historical data)
        var typicalDailyAverage = 10;

        if (adminEvents > typicalDailyAverage * 3) // >3x normal
        {
            var existingInsight = await dbContext.Insights
                .FirstOrDefaultAsync(i => i.TenantId == tenantId &&
                                         i.MessageKey == "insight.security.unusual_admin_activity" &&
                                         i.Status == 0 &&
                                         i.CreatedAt >= since, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = 1, // Security
                    Severity = adminEvents > typicalDailyAverage * 5 ? 2 : 1,
                    ScopeType = "Tenant",
                    ScopeId = tenantId,
                    Title = $"Unusual administrative activity: {adminEvents} events in 24 hours",
                    MessageKey = "insight.security.unusual_admin_activity",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        EventCount = adminEvents,
                        TypicalAverage = typicalDailyAverage,
                        TimeframeHours = 24
                    }),
                    Status = 0,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Insights.Add(insight);
                return 1;
            }
        }

        return 0;
    }
}
