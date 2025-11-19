using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Domain.Services;

namespace Onesign.Modules.IdentityInsights.Infrastructure.Services;

public class InsightGenerationService : IInsightGenerationService
{
    private readonly IInsightRepository _insightRepository;
    private readonly IUserRiskProfileRepository _userRiskProfileRepository;
    private readonly ITenantRiskProfileRepository _tenantRiskProfileRepository;
    private readonly ILogger<InsightGenerationService> _logger;

    private const int HighRiskThreshold = 70;
    private const int CriticalRiskThreshold = 85;
    private const int ZombieAccountDays = 90;

    public InsightGenerationService(
        IInsightRepository insightRepository,
        IUserRiskProfileRepository userRiskProfileRepository,
        ITenantRiskProfileRepository tenantRiskProfileRepository,
        ILogger<InsightGenerationService> logger)
    {
        _insightRepository = insightRepository;
        _userRiskProfileRepository = userRiskProfileRepository;
        _tenantRiskProfileRepository = tenantRiskProfileRepository;
        _logger = logger;
    }

    public async Task GenerateInsightsForTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating insights for tenant {TenantId}", tenantId);

        await GenerateHighRiskUserInsightsAsync(tenantId, cancellationToken);
        await GenerateZombieAccountInsightsAsync(tenantId, cancellationToken);
        await GenerateMfaInsightsAsync(tenantId, cancellationToken);
        await GenerateTenantRiskInsightsAsync(tenantId, cancellationToken);
        await GenerateExcessivePrivilegesInsightsAsync(tenantId, cancellationToken);

        _logger.LogInformation("Completed insight generation for tenant {TenantId}", tenantId);
    }

    public async Task<IReadOnlyList<Insight>> GetOpenInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _insightRepository.GetOpenInsightsAsync(tenantId, cancellationToken);
    }

    private async Task GenerateHighRiskUserInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);
        var highRiskProfiles = profiles.Where(p => p.RiskScore >= HighRiskThreshold).ToList();

        foreach (var profile in highRiskProfiles)
        {
            var existingInsight = await _insightRepository.GetExistingInsightAsync(
                tenantId, InsightType.HighRiskUser, "User", profile.UserId, cancellationToken);

            if (existingInsight == null)
            {
                var severity = profile.RiskScore >= CriticalRiskThreshold
                    ? InsightSeverity.Critical
                    : InsightSeverity.High;

                var insight = new Insight
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = InsightType.HighRiskUser,
                    Severity = severity,
                    ScopeType = "User",
                    ScopeId = profile.UserId,
                    Title = $"High risk user detected: {profile.UserDisplayName}",
                    MessageKey = "insight.user.high_risk",
                    DataJson = JsonSerializer.Serialize(new
                    {
                        UserId = profile.UserId,
                        UserDisplayName = profile.UserDisplayName,
                        RiskScore = profile.RiskScore,
                        RiskFactors = profile.RiskFactorsJson
                    }),
                    Status = InsightStatus.Open,
                    CreatedAt = DateTime.UtcNow
                };

                await _insightRepository.AddAsync(insight, cancellationToken);
                _logger.LogWarning("Generated high-risk insight for user {UserId} with score {Score}",
                    profile.UserId, profile.RiskScore);
            }
        }
    }

    private async Task GenerateZombieAccountInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);
        var cutoffDate = DateTime.UtcNow.AddDays(-ZombieAccountDays);
        var zombieAccounts = profiles.Where(p => p.LastLoginAt == null || p.LastLoginAt < cutoffDate).ToList();

        foreach (var profile in zombieAccounts)
        {
            var existingInsight = await _insightRepository.GetExistingInsightAsync(
                tenantId, InsightType.ZombieAccount, "User", profile.UserId, cancellationToken);

            if (existingInsight == null)
            {
                var daysSinceLogin = profile.LastLoginAt.HasValue
                    ? (int)(DateTime.UtcNow - profile.LastLoginAt.Value).TotalDays
                    : -1;

                var insight = new Insight
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = InsightType.ZombieAccount,
                    Severity = InsightSeverity.Medium,
                    ScopeType = "User",
                    ScopeId = profile.UserId,
                    Title = $"Inactive account detected: {profile.UserDisplayName}",
                    MessageKey = "insight.user.zombie_account",
                    DataJson = JsonSerializer.Serialize(new
                    {
                        UserId = profile.UserId,
                        UserDisplayName = profile.UserDisplayName,
                        LastLoginAt = profile.LastLoginAt,
                        DaysSinceLogin = daysSinceLogin
                    }),
                    Status = InsightStatus.Open,
                    CreatedAt = DateTime.UtcNow
                };

                await _insightRepository.AddAsync(insight, cancellationToken);
                _logger.LogInformation("Generated zombie account insight for user {UserId}", profile.UserId);
            }
        }
    }

    private async Task GenerateMfaInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);
        var noMfaProfiles = profiles.Where(p => !p.MfaEnabled && p.PrivilegedRolesCount > 0).ToList();

        foreach (var profile in noMfaProfiles)
        {
            var existingInsight = await _insightRepository.GetExistingInsightAsync(
                tenantId, InsightType.MfaNotEnabled, "User", profile.UserId, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Insight
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = InsightType.MfaNotEnabled,
                    Severity = InsightSeverity.High,
                    ScopeType = "User",
                    ScopeId = profile.UserId,
                    Title = $"Privileged user without MFA: {profile.UserDisplayName}",
                    MessageKey = "insight.user.mfa_not_enabled",
                    DataJson = JsonSerializer.Serialize(new
                    {
                        UserId = profile.UserId,
                        UserDisplayName = profile.UserDisplayName,
                        PrivilegedRolesCount = profile.PrivilegedRolesCount
                    }),
                    Status = InsightStatus.Open,
                    CreatedAt = DateTime.UtcNow
                };

                await _insightRepository.AddAsync(insight, cancellationToken);
                _logger.LogWarning("Generated MFA insight for privileged user {UserId}", profile.UserId);
            }
        }
    }

    private async Task GenerateTenantRiskInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var tenantProfile = await _tenantRiskProfileRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (tenantProfile == null || tenantProfile.RiskScore < HighRiskThreshold)
            return;

        var existingInsight = await _insightRepository.GetExistingInsightAsync(
            tenantId, InsightType.TenantHighRisk, "Tenant", tenantId, cancellationToken);

        if (existingInsight == null)
        {
            var severity = tenantProfile.RiskScore >= CriticalRiskThreshold
                ? InsightSeverity.Critical
                : InsightSeverity.High;

            var insight = new Insight
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Type = InsightType.TenantHighRisk,
                Severity = severity,
                ScopeType = "Tenant",
                ScopeId = tenantId,
                Title = $"Tenant security risk score is elevated: {tenantProfile.RiskScore}",
                MessageKey = "insight.tenant.high_risk",
                DataJson = JsonSerializer.Serialize(new
                {
                    TenantId = tenantId,
                    RiskScore = tenantProfile.RiskScore,
                    HighRiskUsersCount = tenantProfile.HighRiskUsersCount,
                    MfaEnrollmentRate = tenantProfile.MfaEnrollmentRate
                }),
                Status = InsightStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            await _insightRepository.AddAsync(insight, cancellationToken);
            _logger.LogWarning("Generated tenant high-risk insight for tenant {TenantId} with score {Score}",
                tenantId, tenantProfile.RiskScore);
        }
    }

    private async Task GenerateExcessivePrivilegesInsightsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);
        var excessivePrivileges = profiles.Where(p => p.PrivilegedRolesCount > 5).ToList();

        foreach (var profile in excessivePrivileges)
        {
            var existingInsight = await _insightRepository.GetExistingInsightAsync(
                tenantId, InsightType.ExcessivePrivileges, "User", profile.UserId, cancellationToken);

            if (existingInsight == null)
            {
                var insight = new Insight
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Type = InsightType.ExcessivePrivileges,
                    Severity = InsightSeverity.Medium,
                    ScopeType = "User",
                    ScopeId = profile.UserId,
                    Title = $"User has excessive privileges: {profile.UserDisplayName}",
                    MessageKey = "insight.user.excessive_privileges",
                    DataJson = JsonSerializer.Serialize(new
                    {
                        UserId = profile.UserId,
                        UserDisplayName = profile.UserDisplayName,
                        PrivilegedRolesCount = profile.PrivilegedRolesCount
                    }),
                    Status = InsightStatus.Open,
                    CreatedAt = DateTime.UtcNow
                };

                await _insightRepository.AddAsync(insight, cancellationToken);
                _logger.LogInformation("Generated excessive privileges insight for user {UserId}", profile.UserId);
            }
        }
    }
}
