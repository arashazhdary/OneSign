using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Application.Queries;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Handlers;

public class GetTenantInsightsOverviewQueryHandler : IRequestHandler<GetTenantInsightsOverviewQuery, TenantInsightsOverviewDto?>
{
    private readonly ITenantDailyUsageSnapshotRepository _repository;
    private readonly ILogger<GetTenantInsightsOverviewQueryHandler> _logger;

    public GetTenantInsightsOverviewQueryHandler(
        ITenantDailyUsageSnapshotRepository repository,
        ILogger<GetTenantInsightsOverviewQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<TenantInsightsOverviewDto?> Handle(GetTenantInsightsOverviewQuery request, CancellationToken cancellationToken)
    {
        var snapshots = await _repository.GetByTenantAndDateRangeAsync(request.TenantId, request.From, request.To, cancellationToken);

        if (snapshots.Count == 0)
        {
            _logger.LogInformation("No snapshots found for tenant {TenantId} between {From} and {To}", request.TenantId, request.From, request.To);
            return null;
        }

        var timeSeries = snapshots.Select(s => new TenantDailyUsageDataPointDto
        {
            Date = s.Date,
            TotalUsers = s.TotalUsers,
            ActiveUsers = s.ActiveUsers,
            MfaEnabledUsers = s.MfaEnabledUsers,
            TotalApplications = s.TotalApplications,
            ApplicationsWithSSOEnabled = s.ApplicationsWithSSOEnabled,
            TotalSignInCount = s.TotalSignInCount,
            FailedSignInCount = s.FailedSignInCount,
            HighRiskSignInCount = s.HighRiskSignInCount,
            AccessRequestCount = s.AccessRequestCount,
            AccessRequestApprovedCount = s.AccessRequestApprovedCount,
            LifecycleEventsCount = s.LifecycleEventsCount,
            EmergencyAccessCount = s.EmergencyAccessCount
        }).ToList();

        var latest = snapshots.OrderByDescending(s => s.Date).First();
        var totalSignIns = snapshots.Sum(s => s.TotalSignInCount);
        var failedSignIns = snapshots.Sum(s => s.FailedSignInCount);
        var highRiskSignIns = snapshots.Sum(s => s.HighRiskSignInCount);
        var totalAccessRequests = snapshots.Sum(s => s.AccessRequestCount);
        var approvedAccessRequests = snapshots.Sum(s => s.AccessRequestApprovedCount);

        var summary = new TenantInsightsSummaryDto
        {
            TotalUsers = latest.TotalUsers,
            ActiveUsers = latest.ActiveUsers,
            MfaEnabledUsers = latest.MfaEnabledUsers,
            MfaAdoptionPercent = latest.TotalUsers > 0 ? Math.Round((decimal)latest.MfaEnabledUsers / latest.TotalUsers * 100, 2) : 0,
            TotalApplications = latest.TotalApplications,
            ApplicationsWithSSOEnabled = latest.ApplicationsWithSSOEnabled,
            SsoCoveragePercent = latest.TotalApplications > 0 ? Math.Round((decimal)latest.ApplicationsWithSSOEnabled / latest.TotalApplications * 100, 2) : 0,
            TotalSignIns = totalSignIns,
            FailedSignIns = failedSignIns,
            HighRiskSignIns = highRiskSignIns,
            SignInSuccessRate = totalSignIns > 0 ? Math.Round((decimal)(totalSignIns - failedSignIns) / totalSignIns * 100, 2) : 100,
            TotalAccessRequests = totalAccessRequests,
            ApprovedAccessRequests = approvedAccessRequests,
            AccessRequestApprovalRate = totalAccessRequests > 0 ? Math.Round((decimal)approvedAccessRequests / totalAccessRequests * 100, 2) : 0,
            LifecycleEvents = snapshots.Sum(s => s.LifecycleEventsCount),
            EmergencyAccessEvents = snapshots.Sum(s => s.EmergencyAccessCount),
            AverageActiveUsersPerDay = snapshots.Count > 0 ? Math.Round((decimal)snapshots.Sum(s => s.ActiveUsers) / snapshots.Count, 2) : 0,
            AverageSignInsPerDay = snapshots.Count > 0 ? Math.Round((decimal)totalSignIns / snapshots.Count, 2) : 0
        };

        return new TenantInsightsOverviewDto
        {
            TenantId = request.TenantId,
            From = request.From,
            To = request.To,
            TimeSeries = timeSeries,
            Summary = summary
        };
    }
}

public class GetApplicationUsageQueryHandler : IRequestHandler<GetApplicationUsageQuery, ApplicationUsageListDto?>
{
    private readonly IApplicationDailyUsageSnapshotRepository _repository;
    private readonly ILogger<GetApplicationUsageQueryHandler> _logger;

    public GetApplicationUsageQueryHandler(
        IApplicationDailyUsageSnapshotRepository repository,
        ILogger<GetApplicationUsageQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ApplicationUsageListDto?> Handle(GetApplicationUsageQuery request, CancellationToken cancellationToken)
    {
        var snapshots = await _repository.GetByTenantAndDateAsync(request.TenantId, request.Date, cancellationToken);

        var applications = snapshots.Select(s => new ApplicationUsageDto
        {
            ApplicationId = s.ApplicationId,
            Date = s.Date,
            UniqueUsers = s.UniqueUsers,
            SignInCount = s.SignInCount,
            FailedSignInCount = s.FailedSignInCount,
            HighRiskSignInCount = s.HighRiskSignInCount,
            SuccessRate = s.SignInCount > 0 ? Math.Round((decimal)(s.SignInCount - s.FailedSignInCount) / s.SignInCount * 100, 2) : 100
        }).ToList();

        return new ApplicationUsageListDto
        {
            TenantId = request.TenantId,
            Date = request.Date,
            Applications = applications,
            TotalApplications = applications.Count,
            TotalSignIns = snapshots.Sum(s => s.SignInCount),
            TotalUniqueUsers = snapshots.Sum(s => s.UniqueUsers)
        };
    }
}

public class GetUserSecurityPostureQueryHandler : IRequestHandler<GetUserSecurityPostureQuery, UserSecurityPostureListDto>
{
    private readonly IUserSecurityPostureRepository _repository;
    private readonly ILogger<GetUserSecurityPostureQueryHandler> _logger;

    public GetUserSecurityPostureQueryHandler(
        IUserSecurityPostureRepository repository,
        ILogger<GetUserSecurityPostureQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<UserSecurityPostureListDto> Handle(GetUserSecurityPostureQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<UserSecurityPosture> postures;

        if (request.MinHighRiskEvents.HasValue)
        {
            postures = await _repository.GetHighRiskUsersAsync(request.TenantId, request.MinHighRiskEvents.Value, request.PageSize, cancellationToken);
        }
        else if (request.MfaEnabled == false)
        {
            postures = await _repository.GetUsersWithoutMfaAsync(request.TenantId, request.PageSize, cancellationToken);
        }
        else if (request.DaysInactive.HasValue)
        {
            postures = await _repository.GetInactiveUsersAsync(request.TenantId, request.DaysInactive.Value, request.PageSize, cancellationToken);
        }
        else
        {
            var skip = (request.Page - 1) * request.PageSize;
            postures = await _repository.GetByTenantIdPagedAsync(request.TenantId, skip, request.PageSize, cancellationToken);
        }

        var totalCount = await _repository.GetTotalCountAsync(request.TenantId, cancellationToken);
        var allPostures = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var users = postures.Select(p => new UserSecurityPostureDto
        {
            Id = p.Id,
            UserId = p.UserId,
            LastSignInAt = p.LastSignInAt,
            MfaEnabled = p.MfaEnabled,
            EnabledAppsCount = p.EnabledAppsCount,
            UsedAppsLast30DaysCount = p.UsedAppsLast30DaysCount,
            HighRiskEventsLast30Days = p.HighRiskEventsLast30Days,
            IsAnonymized = p.IsAnonymized,
            UpdatedAt = p.UpdatedAt,
            RiskLevel = CalculateRiskLevel(p)
        }).ToList();

        var usersWithMfa = allPostures.Count(p => p.MfaEnabled);
        var highRiskUsers = allPostures.Count(p => p.HighRiskEventsLast30Days >= 5);
        var mediumRiskUsers = allPostures.Count(p => p.HighRiskEventsLast30Days >= 2 && p.HighRiskEventsLast30Days < 5);
        var inactiveUsers = allPostures.Count(p => p.LastSignInAt == null || p.LastSignInAt < DateTime.UtcNow.AddDays(-30));

        var summary = new UserSecurityPostureSummaryDto
        {
            TotalUsers = totalCount,
            UsersWithMfa = usersWithMfa,
            UsersWithoutMfa = totalCount - usersWithMfa,
            MfaAdoptionPercent = totalCount > 0 ? Math.Round((decimal)usersWithMfa / totalCount * 100, 2) : 0,
            HighRiskUsers = highRiskUsers,
            MediumRiskUsers = mediumRiskUsers,
            LowRiskUsers = totalCount - highRiskUsers - mediumRiskUsers,
            InactiveUsers = inactiveUsers
        };

        return new UserSecurityPostureListDto
        {
            TenantId = request.TenantId,
            Users = users,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            Summary = summary
        };
    }

    private static string CalculateRiskLevel(UserSecurityPosture posture)
    {
        if (posture.HighRiskEventsLast30Days >= 5 || (!posture.MfaEnabled && posture.HighRiskEventsLast30Days >= 2))
            return "High";
        if (posture.HighRiskEventsLast30Days >= 2 || !posture.MfaEnabled)
            return "Medium";
        return "Low";
    }
}

public class GetReportSubscriptionsQueryHandler : IRequestHandler<GetReportSubscriptionsQuery, ReportSubscriptionListDto>
{
    private readonly IReportSubscriptionRepository _repository;
    private readonly ILogger<GetReportSubscriptionsQueryHandler> _logger;

    public GetReportSubscriptionsQueryHandler(
        IReportSubscriptionRepository repository,
        ILogger<GetReportSubscriptionsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ReportSubscriptionListDto> Handle(GetReportSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<ReportSubscription> subscriptions;

        if (request.ScopeType.HasValue)
        {
            subscriptions = await _repository.GetByScopeAsync(request.ScopeType.Value, request.ScopeId, cancellationToken);
        }
        else if (request.ReportType.HasValue)
        {
            subscriptions = await _repository.GetByReportTypeAsync(request.ReportType.Value, cancellationToken);
        }
        else if (request.CreatedByUserId.HasValue)
        {
            subscriptions = await _repository.GetByCreatedByUserIdAsync(request.CreatedByUserId.Value, cancellationToken);
        }
        else if (request.IsActive == true)
        {
            subscriptions = await _repository.GetActiveSubscriptionsAsync(cancellationToken);
        }
        else
        {
            subscriptions = await _repository.GetActiveSubscriptionsAsync(cancellationToken);
        }

        var dtos = subscriptions.Select(s => new ReportSubscriptionDto
        {
            Id = s.Id,
            ScopeType = s.ScopeType,
            ScopeId = s.ScopeId,
            ReportType = s.ReportType,
            CronOrFrequency = s.CronOrFrequency,
            EmailRecipients = s.EmailRecipients.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            CreatedByUserId = s.CreatedByUserId,
            UpdatedAt = s.UpdatedAt,
            UpdatedByUserId = s.UpdatedByUserId
        }).ToList();

        return new ReportSubscriptionListDto
        {
            Subscriptions = dtos,
            TotalCount = dtos.Count
        };
    }
}

public class GetGlobalTenantsOverviewQueryHandler : IRequestHandler<GetGlobalTenantsOverviewQuery, GlobalTenantOverviewDto>
{
    private readonly ITenantDailyUsageSnapshotRepository _repository;
    private readonly ILogger<GetGlobalTenantsOverviewQueryHandler> _logger;

    public GetGlobalTenantsOverviewQueryHandler(
        ITenantDailyUsageSnapshotRepository repository,
        ILogger<GetGlobalTenantsOverviewQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<GlobalTenantOverviewDto> Handle(GetGlobalTenantsOverviewQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var snapshots = await _repository.GetAllByDateAsync(date, cancellationToken);

        if (snapshots.Count == 0 && request.Days > 1)
        {
            snapshots = await _repository.GetLatestByTenantsAsync(request.Days, cancellationToken);
        }

        var tenants = snapshots.Select(s => new TenantOverviewItemDto
        {
            TenantId = s.TenantId,
            Date = s.Date,
            TotalUsers = s.TotalUsers,
            ActiveUsers = s.ActiveUsers,
            MfaEnabledUsers = s.MfaEnabledUsers,
            MfaAdoptionPercent = s.TotalUsers > 0 ? Math.Round((decimal)s.MfaEnabledUsers / s.TotalUsers * 100, 2) : 0,
            TotalApplications = s.TotalApplications,
            ApplicationsWithSSOEnabled = s.ApplicationsWithSSOEnabled,
            SsoCoveragePercent = s.TotalApplications > 0 ? Math.Round((decimal)s.ApplicationsWithSSOEnabled / s.TotalApplications * 100, 2) : 0,
            TotalSignInCount = s.TotalSignInCount,
            FailedSignInCount = s.FailedSignInCount,
            HighRiskSignInCount = s.HighRiskSignInCount,
            SignInSuccessRate = s.TotalSignInCount > 0 ? Math.Round((decimal)(s.TotalSignInCount - s.FailedSignInCount) / s.TotalSignInCount * 100, 2) : 100,
            AccessRequestCount = s.AccessRequestCount,
            LifecycleEventsCount = s.LifecycleEventsCount,
            EmergencyAccessCount = s.EmergencyAccessCount,
            RiskLevel = CalculateTenantRiskLevel(s)
        }).ToList();

        var totalUsers = tenants.Sum(t => t.TotalUsers);
        var totalSignIns = tenants.Sum(t => t.TotalSignInCount);
        var totalFailedSignIns = tenants.Sum(t => t.FailedSignInCount);

        var summary = new GlobalSummaryDto
        {
            TotalTenants = tenants.Count,
            TotalUsers = totalUsers,
            TotalActiveUsers = tenants.Sum(t => t.ActiveUsers),
            TotalApplications = tenants.Sum(t => t.TotalApplications),
            TotalSignIns = totalSignIns,
            TotalFailedSignIns = totalFailedSignIns,
            TotalHighRiskSignIns = tenants.Sum(t => t.HighRiskSignInCount),
            AverageMfaAdoptionPercent = tenants.Count > 0 ? Math.Round(tenants.Average(t => t.MfaAdoptionPercent), 2) : 0,
            AverageSsoCoveragePercent = tenants.Count > 0 ? Math.Round(tenants.Average(t => t.SsoCoveragePercent), 2) : 0,
            OverallSignInSuccessRate = totalSignIns > 0 ? Math.Round((decimal)(totalSignIns - totalFailedSignIns) / totalSignIns * 100, 2) : 100,
            HighRiskTenants = tenants.Count(t => t.RiskLevel == "High"),
            MediumRiskTenants = tenants.Count(t => t.RiskLevel == "Medium"),
            LowRiskTenants = tenants.Count(t => t.RiskLevel == "Low")
        };

        return new GlobalTenantOverviewDto
        {
            Tenants = tenants,
            Summary = summary
        };
    }

    private static string CalculateTenantRiskLevel(TenantDailyUsageSnapshot snapshot)
    {
        var mfaPercent = snapshot.TotalUsers > 0 ? (decimal)snapshot.MfaEnabledUsers / snapshot.TotalUsers * 100 : 0;
        var failedPercent = snapshot.TotalSignInCount > 0 ? (decimal)snapshot.FailedSignInCount / snapshot.TotalSignInCount * 100 : 0;

        if (mfaPercent < 50 || failedPercent > 20 || snapshot.HighRiskSignInCount > 10 || snapshot.EmergencyAccessCount > 5)
            return "High";
        if (mfaPercent < 80 || failedPercent > 10 || snapshot.HighRiskSignInCount > 3)
            return "Medium";
        return "Low";
    }
}

public class GetRiskyTenantsQueryHandler : IRequestHandler<GetRiskyTenantsQuery, RiskyTenantsListDto>
{
    private readonly ITenantDailyUsageSnapshotRepository _repository;
    private readonly ILogger<GetRiskyTenantsQueryHandler> _logger;

    public GetRiskyTenantsQueryHandler(
        ITenantDailyUsageSnapshotRepository repository,
        ILogger<GetRiskyTenantsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<RiskyTenantsListDto> Handle(GetRiskyTenantsQuery request, CancellationToken cancellationToken)
    {
        var snapshots = await _repository.GetLatestByTenantsAsync(request.Days, cancellationToken);

        var tenantSnapshots = snapshots
            .GroupBy(s => s.TenantId)
            .Select(g => new
            {
                TenantId = g.Key,
                Snapshots = g.OrderByDescending(s => s.Date).ToList()
            })
            .ToList();

        var riskyTenants = new List<RiskyTenantDto>();

        foreach (var tenant in tenantSnapshots)
        {
            var latest = tenant.Snapshots.First();
            var riskScore = CalculateRiskScore(tenant.Snapshots);

            if (riskScore >= request.MinRiskScore)
            {
                var riskFactors = GetRiskFactors(tenant.Snapshots);
                var mfaPercent = latest.TotalUsers > 0 ? Math.Round((decimal)latest.MfaEnabledUsers / latest.TotalUsers * 100, 2) : 0;

                riskyTenants.Add(new RiskyTenantDto
                {
                    TenantId = tenant.TenantId,
                    RiskLevel = riskScore >= 80 ? "High" : "Medium",
                    RiskScore = riskScore,
                    RiskFactors = riskFactors,
                    TotalUsers = latest.TotalUsers,
                    MfaEnabledUsers = latest.MfaEnabledUsers,
                    MfaAdoptionPercent = mfaPercent,
                    HighRiskSignInsLast30Days = tenant.Snapshots.Sum(s => s.HighRiskSignInCount),
                    FailedSignInsLast30Days = tenant.Snapshots.Sum(s => s.FailedSignInCount),
                    EmergencyAccessEventsLast30Days = tenant.Snapshots.Sum(s => s.EmergencyAccessCount),
                    LastSnapshotDate = latest.Date
                });
            }
        }

        var orderedTenants = riskyTenants
            .OrderByDescending(t => t.RiskScore)
            .Take(request.Top)
            .ToList();

        return new RiskyTenantsListDto
        {
            Tenants = orderedTenants,
            TotalCount = orderedTenants.Count,
            HighRiskCount = orderedTenants.Count(t => t.RiskLevel == "High"),
            MediumRiskCount = orderedTenants.Count(t => t.RiskLevel == "Medium")
        };
    }

    private static int CalculateRiskScore(List<TenantDailyUsageSnapshot> snapshots)
    {
        var latest = snapshots.First();
        var score = 0;

        var mfaPercent = latest.TotalUsers > 0 ? (decimal)latest.MfaEnabledUsers / latest.TotalUsers * 100 : 0;
        if (mfaPercent < 50) score += 30;
        else if (mfaPercent < 80) score += 15;

        var totalSignIns = snapshots.Sum(s => s.TotalSignInCount);
        var failedSignIns = snapshots.Sum(s => s.FailedSignInCount);
        var failedPercent = totalSignIns > 0 ? (decimal)failedSignIns / totalSignIns * 100 : 0;
        if (failedPercent > 20) score += 25;
        else if (failedPercent > 10) score += 10;

        var highRiskSignIns = snapshots.Sum(s => s.HighRiskSignInCount);
        if (highRiskSignIns > 50) score += 30;
        else if (highRiskSignIns > 10) score += 15;

        var emergencyAccess = snapshots.Sum(s => s.EmergencyAccessCount);
        if (emergencyAccess > 10) score += 15;
        else if (emergencyAccess > 3) score += 5;

        return Math.Min(score, 100);
    }

    private static List<string> GetRiskFactors(List<TenantDailyUsageSnapshot> snapshots)
    {
        var factors = new List<string>();
        var latest = snapshots.First();

        var mfaPercent = latest.TotalUsers > 0 ? (decimal)latest.MfaEnabledUsers / latest.TotalUsers * 100 : 0;
        if (mfaPercent < 50) factors.Add("Low MFA adoption (< 50%)");
        else if (mfaPercent < 80) factors.Add("Moderate MFA adoption (< 80%)");

        var totalSignIns = snapshots.Sum(s => s.TotalSignInCount);
        var failedSignIns = snapshots.Sum(s => s.FailedSignInCount);
        var failedPercent = totalSignIns > 0 ? (decimal)failedSignIns / totalSignIns * 100 : 0;
        if (failedPercent > 20) factors.Add("High failed sign-in rate (> 20%)");
        else if (failedPercent > 10) factors.Add("Elevated failed sign-in rate (> 10%)");

        var highRiskSignIns = snapshots.Sum(s => s.HighRiskSignInCount);
        if (highRiskSignIns > 50) factors.Add("High number of risky sign-ins");
        else if (highRiskSignIns > 10) factors.Add("Elevated risky sign-ins");

        var emergencyAccess = snapshots.Sum(s => s.EmergencyAccessCount);
        if (emergencyAccess > 10) factors.Add("Frequent emergency access usage");
        else if (emergencyAccess > 3) factors.Add("Multiple emergency access events");

        return factors;
    }
}
