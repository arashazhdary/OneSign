using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Domain.Services;

namespace Onesign.Modules.IdentityInsights.Infrastructure.Services;

public class RiskScoringService : IRiskScoringService
{
    private readonly IUserRiskProfileRepository _userRiskProfileRepository;
    private readonly ITenantRiskProfileRepository _tenantRiskProfileRepository;
    private readonly IInsightRepository _insightRepository;
    private readonly ILogger<RiskScoringService> _logger;

    private const int MfaDisabledImpact = 20;
    private const int PrivilegedRoleImpact = 10;
    private const int ExcessivePrivilegedRolesImpact = 20;
    private const int HighFailedLoginsImpact = 25;
    private const int MediumFailedLoginsImpact = 15;
    private const int StaleAccessImpact = 15;
    private const int ExcessiveAppsImpact = 10;
    private const int SodViolationImpact = 30;

    public RiskScoringService(
        IUserRiskProfileRepository userRiskProfileRepository,
        ITenantRiskProfileRepository tenantRiskProfileRepository,
        IInsightRepository insightRepository,
        ILogger<RiskScoringService> logger)
    {
        _userRiskProfileRepository = userRiskProfileRepository;
        _tenantRiskProfileRepository = tenantRiskProfileRepository;
        _insightRepository = insightRepository;
        _logger = logger;
    }

    public async Task<UserRiskProfile> CalculateUserRiskAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var existingProfile = await _userRiskProfileRepository.GetByUserIdAsync(tenantId, userId, cancellationToken);

        var riskFactors = new List<string>();
        var riskScore = 0;

        // Factor 1: MFA status impact
        var mfaEnabled = existingProfile?.MfaEnabled ?? false;
        if (!mfaEnabled)
        {
            riskScore += MfaDisabledImpact;
            riskFactors.Add("MFA not enabled");
        }

        // Factor 2: Privileged role impact
        var privilegedRolesCount = existingProfile?.PrivilegedRolesCount ?? 0;
        if (privilegedRolesCount > 5)
        {
            riskScore += ExcessivePrivilegedRolesImpact;
            riskFactors.Add($"Excessive privileged roles: {privilegedRolesCount}");
        }
        else if (privilegedRolesCount > 2)
        {
            riskScore += PrivilegedRoleImpact;
            riskFactors.Add($"Multiple privileged roles: {privilegedRolesCount}");
        }

        // Factor 3: Failed login patterns
        var failedLoginCount = existingProfile?.FailedLoginCount ?? 0;
        if (failedLoginCount > 10)
        {
            riskScore += HighFailedLoginsImpact;
            riskFactors.Add($"High failed login attempts: {failedLoginCount}");
        }
        else if (failedLoginCount > 5)
        {
            riskScore += MediumFailedLoginsImpact;
            riskFactors.Add($"Multiple failed login attempts: {failedLoginCount}");
        }

        // Factor 4: Stale access detection
        var lastLoginAt = existingProfile?.LastLoginAt;
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        if (lastLoginAt == null || lastLoginAt < thirtyDaysAgo)
        {
            riskScore += StaleAccessImpact;
            riskFactors.Add("No recent login activity");
        }

        // Factor 5: Application access surface
        var applicationsCount = existingProfile?.ApplicationsCount ?? 0;
        if (applicationsCount > 20)
        {
            riskScore += ExcessiveAppsImpact;
            riskFactors.Add($"Access to many applications: {applicationsCount}");
        }

        // Cap risk score at 100
        riskScore = Math.Min(riskScore, 100);

        var profile = new UserRiskProfile
        {
            Id = existingProfile?.Id ?? Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            UserDisplayName = existingProfile?.UserDisplayName ?? string.Empty,
            RiskScore = riskScore,
            RiskFactorsJson = JsonSerializer.Serialize(riskFactors),
            LastLoginAt = lastLoginAt,
            FailedLoginCount = failedLoginCount,
            MfaEnabled = mfaEnabled,
            PrivilegedRolesCount = privilegedRolesCount,
            ApplicationsCount = applicationsCount,
            CalculatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (existingProfile == null)
        {
            await _userRiskProfileRepository.AddAsync(profile, cancellationToken);
        }
        else
        {
            await _userRiskProfileRepository.UpdateAsync(profile, cancellationToken);
        }

        _logger.LogDebug("Calculated risk score {Score} for user {UserId} in tenant {TenantId}",
            riskScore, userId, tenantId);

        return profile;
    }

    public async Task<TenantRiskProfile> CalculateTenantRiskAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var userProfiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);

        var usersCount = userProfiles.Count;
        var highRiskUsersCount = userProfiles.Count(p => p.RiskScore >= 70);
        var mfaEnabledCount = userProfiles.Count(p => p.MfaEnabled);
        var privilegedUsersCount = userProfiles.Count(p => p.PrivilegedRolesCount > 0);
        var totalFailedLogins = userProfiles.Sum(p => p.FailedLoginCount);

        var mfaEnrollmentRate = usersCount > 0 ? (decimal)mfaEnabledCount / usersCount * 100 : 0;
        var failedLoginRate = usersCount > 0 ? (decimal)totalFailedLogins / usersCount : 0;

        // Calculate tenant risk score based on aggregated metrics
        var tenantRiskScore = 0;

        // High-risk users impact
        var highRiskRatio = usersCount > 0 ? (decimal)highRiskUsersCount / usersCount : 0;
        if (highRiskRatio > 0.3m)
            tenantRiskScore += 30;
        else if (highRiskRatio > 0.1m)
            tenantRiskScore += 15;

        // Low MFA enrollment impact
        if (mfaEnrollmentRate < 50)
            tenantRiskScore += 25;
        else if (mfaEnrollmentRate < 80)
            tenantRiskScore += 10;

        // High failed login rate impact
        if (failedLoginRate > 5)
            tenantRiskScore += 20;
        else if (failedLoginRate > 2)
            tenantRiskScore += 10;

        // Privileged users concentration
        var privilegedRatio = usersCount > 0 ? (decimal)privilegedUsersCount / usersCount : 0;
        if (privilegedRatio > 0.2m)
            tenantRiskScore += 15;

        tenantRiskScore = Math.Min(tenantRiskScore, 100);

        var existingProfile = await _tenantRiskProfileRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        var profile = new TenantRiskProfile
        {
            Id = existingProfile?.Id ?? Guid.NewGuid(),
            TenantId = tenantId,
            RiskScore = tenantRiskScore,
            UsersCount = usersCount,
            HighRiskUsersCount = highRiskUsersCount,
            MfaEnrollmentRate = mfaEnrollmentRate,
            PrivilegedUsersCount = privilegedUsersCount,
            FailedLoginRate = failedLoginRate,
            OpenGovernanceFindingsCount = 0,
            CalculatedAt = DateTime.UtcNow
        };

        if (existingProfile == null)
        {
            await _tenantRiskProfileRepository.AddAsync(profile, cancellationToken);
        }
        else
        {
            await _tenantRiskProfileRepository.UpdateAsync(profile, cancellationToken);
        }

        _logger.LogInformation("Calculated tenant risk score {Score} for tenant {TenantId} with {UserCount} users",
            tenantRiskScore, tenantId, usersCount);

        return profile;
    }

    public async Task<IReadOnlyList<UserRiskProfile>> GetHighRiskUsersAsync(
        Guid tenantId,
        int threshold = 70,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);

        return profiles
            .Where(p => p.RiskScore >= threshold)
            .OrderByDescending(p => p.RiskScore)
            .Take(limit)
            .ToList();
    }

    public async Task<IReadOnlyList<UserRiskProfile>> GetZombieAccountsAsync(
        Guid tenantId,
        int inactiveDays = 90,
        CancellationToken cancellationToken = default)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);
        var cutoffDate = DateTime.UtcNow.AddDays(-inactiveDays);

        return profiles
            .Where(p => p.LastLoginAt == null || p.LastLoginAt < cutoffDate)
            .OrderBy(p => p.LastLoginAt)
            .ToList();
    }

    public async Task RecalculateAllUsersAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var profiles = await _userRiskProfileRepository.GetAllByTenantAsync(tenantId, cancellationToken);

        foreach (var profile in profiles)
        {
            await CalculateUserRiskAsync(tenantId, profile.UserId, cancellationToken);
        }

        await CalculateTenantRiskAsync(tenantId, cancellationToken);

        _logger.LogInformation("Recalculated risk scores for {Count} users in tenant {TenantId}",
            profiles.Count, tenantId);
    }
}
