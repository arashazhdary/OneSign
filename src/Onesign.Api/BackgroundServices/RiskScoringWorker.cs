using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that periodically recalculates user risk scores
/// and generates insights for high-risk changes.
/// </summary>
public class RiskScoringWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RiskScoringWorker> _logger;
    private readonly IConfiguration _configuration;

    private const int HighRiskThreshold = 70;
    private const int CriticalRiskThreshold = 85;

    public RiskScoringWorker(
        IServiceProvider serviceProvider,
        ILogger<RiskScoringWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:RiskScoring:IntervalMinutes", 60);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);

        _logger.LogInformation("RiskScoringWorker starting with interval of {Interval} minutes", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RecalculateRiskScoresAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RiskScoringWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task RecalculateRiskScoresAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get all tenants
        var tenants = await dbContext.Tenants
            .Where(t => t.Status == Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Starting risk score calculation for {TenantCount} tenants", tenants.Count);

        foreach (var tenantId in tenants)
        {
            try
            {
                await RecalculateTenantRiskScoresAsync(dbContext, tenantId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating risk scores for tenant {TenantId}", tenantId);
            }
        }

        _logger.LogInformation("Risk scoring completed at {Time}", DateTime.UtcNow);
    }

    private async Task RecalculateTenantRiskScoresAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var users = await dbContext.TenantUsers
            .Where(u => u.TenantId == tenantId && u.IsActive)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        foreach (var user in users)
        {
            var riskFactors = new List<string>();
            var riskScore = 0;

            // Get global user for display name
            var globalUser = await dbContext.GlobalUsers
                .FirstOrDefaultAsync(g => g.Id == user.GlobalUserId, cancellationToken);

            // Factor 1: MFA not enabled (+20 points)
            var hasMfa = await dbContext.UserMfaMethods
                .AnyAsync(m => m.TenantUserId == user.Id && m.IsVerified, cancellationToken);
            if (!hasMfa)
            {
                riskScore += 20;
                riskFactors.Add("MFA not enabled");
            }

            // Factor 2: Failed login attempts in last 30 days
            var failedLogins = await dbContext.AuditEvents
                .CountAsync(a => a.TenantId == tenantId &&
                                a.ActorId == user.Id &&
                                a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.LoginFailed &&
                                a.CreatedAt >= thirtyDaysAgo, cancellationToken);

            if (failedLogins > 10)
            {
                riskScore += 25;
                riskFactors.Add($"High failed login attempts: {failedLogins}");
            }
            else if (failedLogins > 5)
            {
                riskScore += 15;
                riskFactors.Add($"Multiple failed login attempts: {failedLogins}");
            }

            // Factor 3: Privileged roles count
            var privilegedRoles = await dbContext.JitGrants
                .CountAsync(g => g.TenantId == tenantId &&
                                g.UserId == user.Id &&
                                (g.Status == 0 || g.ExpiresAt > now), cancellationToken);

            if (privilegedRoles > 5)
            {
                riskScore += 20;
                riskFactors.Add($"Excessive privileged roles: {privilegedRoles}");
            }
            else if (privilegedRoles > 2)
            {
                riskScore += 10;
                riskFactors.Add($"Multiple privileged roles: {privilegedRoles}");
            }

            // Factor 4: No recent login (potentially orphaned account)
            if (user.LastLoginAt == null || user.LastLoginAt < thirtyDaysAgo)
            {
                riskScore += 15;
                riskFactors.Add("No recent login activity");
            }

            // Factor 5: Applications count (more apps = more attack surface)
            var appsCount = await dbContext.ApplicationOrgUnits
                .Join(dbContext.UserOrgUnits,
                    ao => ao.OrgUnitId,
                    uo => uo.OrgUnitId,
                    (ao, uo) => new { ao, uo })
                .CountAsync(x => x.uo.TenantUserId == user.Id, cancellationToken);

            if (appsCount > 20)
            {
                riskScore += 10;
                riskFactors.Add($"Access to many applications: {appsCount}");
            }

            // Cap risk score at 100
            riskScore = Math.Min(riskScore, 100);

            // Update or create risk profile
            var existingProfile = await dbContext.UserRiskProfiles
                .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.UserId == user.Id, cancellationToken);

            var previousScore = existingProfile?.RiskScore ?? 0;

            if (existingProfile != null)
            {
                existingProfile.RiskScore = riskScore;
                existingProfile.RiskFactorsJson = System.Text.Json.JsonSerializer.Serialize(riskFactors);
                existingProfile.LastLoginAt = user.LastLoginAt;
                existingProfile.FailedLoginCount = failedLogins;
                var hasMfaForProfile = await dbContext.UserMfaMethods
                    .AnyAsync(m => m.TenantUserId == user.Id && m.IsVerified, cancellationToken);
                existingProfile.MfaEnabled = hasMfaForProfile;
                existingProfile.PrivilegedRolesCount = privilegedRoles;
                existingProfile.ApplicationsCount = appsCount;
                existingProfile.CalculatedAt = now;
                existingProfile.UpdatedAt = now;
            }
            else
            {
                var newProfile = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.UserRiskProfileEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = user.Id,
                    UserDisplayName = globalUser?.Email ?? user.Id.ToString(),
                    RiskScore = riskScore,
                    RiskFactorsJson = System.Text.Json.JsonSerializer.Serialize(riskFactors),
                    LastLoginAt = user.LastLoginAt,
                    FailedLoginCount = failedLogins,
                    MfaEnabled = hasMfa,
                    PrivilegedRolesCount = privilegedRoles,
                    ApplicationsCount = appsCount,
                    CalculatedAt = now,
                    UpdatedAt = now
                };
                dbContext.UserRiskProfiles.Add(newProfile);
            }

            // Generate insight for high-risk changes
            if (riskScore >= HighRiskThreshold && previousScore < HighRiskThreshold)
            {
                await GenerateRiskInsightAsync(dbContext, tenantId, user.Id,
                    riskScore, previousScore, riskFactors, cancellationToken);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogDebug("Risk scores updated for {UserCount} users in tenant {TenantId}",
            users.Count, tenantId);
    }

    private async Task GenerateRiskInsightAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        Guid userId,
        int newScore,
        int previousScore,
        List<string> riskFactors,
        CancellationToken cancellationToken)
    {
        var severity = newScore >= CriticalRiskThreshold ? 2 : 1; // 2 = High, 1 = Medium

        var insight = new Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities.InsightEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = 0, // Risk
            Severity = severity,
            ScopeType = "User",
            ScopeId = userId,
            Title = $"User risk score increased to {newScore}",
            MessageKey = "insight.user.risk.elevated",
            DataJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                UserId = userId,
                NewScore = newScore,
                PreviousScore = previousScore,
                RiskFactors = riskFactors
            }),
            Status = 0, // Open
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Insights.Add(insight);

        _logger.LogWarning("Generated high-risk insight for user {UserId} with score {Score}", userId, newScore);

        await Task.CompletedTask;
    }
}
