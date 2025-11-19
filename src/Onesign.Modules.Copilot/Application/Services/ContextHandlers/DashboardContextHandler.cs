using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class DashboardContextHandler : IContextHandler
{
    private readonly ILogger<DashboardContextHandler> _logger;
    private readonly ITenantDailyUsageSnapshotRepository _usageRepository;
    private readonly IUserSecurityPostureRepository _securityPostureRepository;

    public DashboardContextHandler(
        ILogger<DashboardContextHandler> logger,
        ITenantDailyUsageSnapshotRepository usageRepository,
        IUserSecurityPostureRepository securityPostureRepository)
    {
        _logger = logger;
        _usageRepository = usageRepository;
        _securityPostureRepository = securityPostureRepository;
    }

    public ContextType SupportedContextType => ContextType.Dashboard;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Building dashboard context for tenant {TenantId}", tenantId);

        var dashboardData = new DashboardContextData
        {
            TotalUsers = await GetTotalUsersAsync(tenantId, cancellationToken),
            TotalApplications = await GetTotalApplicationsAsync(tenantId, cancellationToken),
            ActiveIncidents = await GetActiveIncidentsCountAsync(tenantId, cancellationToken),
            PendingChangeSets = await GetPendingChangeSetsCountAsync(tenantId, cancellationToken),
            RiskyUsers = await GetRiskyUsersCountAsync(tenantId, cancellationToken),
            RiskyApplications = await GetRiskyApplicationsCountAsync(tenantId, cancellationToken),
            TopRisks = await GetTopRisksAsync(tenantId, cancellationToken),
            RecentActivities = await GetRecentActivitiesAsync(tenantId, cancellationToken),
            MfaStats = await GetMfaStatsAsync(tenantId, cancellationToken),
            SecurityScore = await GetSecurityScoreAsync(tenantId, cancellationToken)
        };

        return new Dictionary<string, object?>
        {
            ["totalUsers"] = dashboardData.TotalUsers,
            ["totalApplications"] = dashboardData.TotalApplications,
            ["activeIncidents"] = dashboardData.ActiveIncidents,
            ["pendingChangeSets"] = dashboardData.PendingChangeSets,
            ["riskyUsers"] = dashboardData.RiskyUsers,
            ["riskyApplications"] = dashboardData.RiskyApplications,
            ["topRisks"] = dashboardData.TopRisks,
            ["recentActivities"] = dashboardData.RecentActivities,
            ["mfaStats"] = dashboardData.MfaStats,
            ["securityScore"] = dashboardData.SecurityScore
        };
    }

    private async Task<int> GetTotalUsersAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.TotalUsers ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get total users for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<int> GetTotalApplicationsAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.TotalApplications ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get total applications for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<int> GetActiveIncidentsCountAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.ActiveIncidents ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get active incidents count for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<int> GetPendingChangeSetsCountAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.PendingChangeSets ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get pending change sets for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<int> GetRiskyUsersCountAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var riskyUsers = await _securityPostureRepository.GetHighRiskUsersAsync(tenantId, 100, cancellationToken);
            return riskyUsers?.Count ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get risky users count for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<int> GetRiskyApplicationsCountAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.RiskyApplications ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get risky applications count for tenant {TenantId}", tenantId);
            return 0;
        }
    }

    private async Task<List<TopRiskDto>> GetTopRisksAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var riskyUsers = await _securityPostureRepository.GetHighRiskUsersAsync(tenantId, 5, cancellationToken);
            if (riskyUsers == null)
                return new List<TopRiskDto>();

            return riskyUsers.Select(u => new TopRiskDto
            {
                RiskType = "UserRisk",
                EntityType = "User",
                EntityId = u.UserId,
                EntityName = u.UserDisplayName ?? "Unknown",
                RiskScore = u.OverallRiskScore,
                Description = $"Risk level: {u.RiskLevel}"
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get top risks for tenant {TenantId}", tenantId);
            return new List<TopRiskDto>();
        }
    }

    private Task<List<RecentActivityDto>> GetRecentActivitiesAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        // Recent activities would come from audit logs
        return Task.FromResult(new List<RecentActivityDto>());
    }

    private async Task<MfaStatsDto> GetMfaStatsAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            if (snapshot == null)
                return new MfaStatsDto();

            return new MfaStatsDto
            {
                TotalUsers = snapshot.TotalUsers,
                MfaEnabledUsers = snapshot.MfaEnabledUsers,
                MfaEnrollmentPercentage = snapshot.TotalUsers > 0
                    ? (decimal)snapshot.MfaEnabledUsers / snapshot.TotalUsers * 100
                    : 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get MFA stats for tenant {TenantId}", tenantId);
            return new MfaStatsDto();
        }
    }

    private async Task<int> GetSecurityScoreAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await _usageRepository.GetLatestAsync(tenantId, cancellationToken);
            return snapshot?.SecurityScore ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get security score for tenant {TenantId}", tenantId);
            return 0;
        }
    }
}

public class MfaStatsDto
{
    public int TotalUsers { get; set; }
    public int MfaEnabledUsers { get; set; }
    public decimal MfaEnrollmentPercentage { get; set; }
}
