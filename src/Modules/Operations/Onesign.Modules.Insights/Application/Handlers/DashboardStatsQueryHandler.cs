using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Application.Queries;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Handlers;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly ITenantDailyUsageSnapshotRepository _tenantSnapshotRepository;
    private readonly IUserSecurityPostureRepository _userSecurityRepository;
    private readonly ILogger<GetDashboardStatsQueryHandler> _logger;

    public GetDashboardStatsQueryHandler(
        ITenantDailyUsageSnapshotRepository tenantSnapshotRepository,
        IUserSecurityPostureRepository userSecurityRepository,
        ILogger<GetDashboardStatsQueryHandler> logger)
    {
        _tenantSnapshotRepository = tenantSnapshotRepository;
        _userSecurityRepository = userSecurityRepository;
        _logger = logger;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-request.TrendDays + 1);

        // Get snapshots for trend data
        var snapshots = await _tenantSnapshotRepository.GetLatestByTenantsAsync(request.TrendDays, cancellationToken);
        var latestSnapshots = await _tenantSnapshotRepository.GetAllByDateAsync(today.AddDays(-1), cancellationToken);

        // If no data for yesterday, try today
        if (latestSnapshots.Count == 0)
        {
            latestSnapshots = await _tenantSnapshotRepository.GetAllByDateAsync(today, cancellationToken);
        }

        // Build summary
        var summary = BuildSummary(latestSnapshots);

        // Build authentication trend
        var authTrend = BuildAuthenticationTrend(snapshots, request.TrendDays);

        // Build MFA distribution
        var mfaDistribution = BuildMfaDistribution(latestSnapshots);

        // Build risk distribution
        var riskDistribution = BuildRiskDistribution(latestSnapshots);

        // Build top tenants
        var topTenants = BuildTopTenants(latestSnapshots, request.TopTenantsCount);

        // Build recent security events (simulated based on snapshot data)
        var recentEvents = BuildRecentSecurityEvents(latestSnapshots, request.RecentEventsCount);

        return new DashboardStatsDto
        {
            Summary = summary,
            AuthenticationTrend = authTrend,
            MfaDistribution = mfaDistribution,
            RiskDistribution = riskDistribution,
            TopTenants = topTenants,
            RecentSecurityEvents = recentEvents
        };
    }

    private DashboardSummaryDto BuildSummary(IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots)
    {
        var totalUsers = snapshots.Sum(s => s.TotalUsers);
        var activeUsers = snapshots.Sum(s => s.ActiveUsers);
        var mfaEnabled = snapshots.Sum(s => s.MfaEnabledUsers);
        var totalAuth = snapshots.Sum(s => s.TotalSignInCount);
        var failedAuth = snapshots.Sum(s => s.FailedSignInCount);
        var highRisk = snapshots.Sum(s => s.HighRiskSignInCount);

        var activeTenants = snapshots.Count(s => s.ActiveUsers > 0 || s.TotalSignInCount > 0);

        return new DashboardSummaryDto
        {
            TotalTenants = snapshots.Select(s => s.TenantId).Distinct().Count(),
            ActiveTenants = activeTenants,
            TotalUsers = totalUsers,
            ActiveUsersToday = activeUsers,
            TotalApplications = snapshots.Sum(s => s.TotalApplications),
            TotalAuthenticationsToday = totalAuth,
            FailedAuthenticationsToday = failedAuth,
            AuthSuccessRate = totalAuth > 0 ? Math.Round((decimal)(totalAuth - failedAuth) / totalAuth * 100, 1) : 100,
            MfaAdoptionRate = totalUsers > 0 ? Math.Round((decimal)mfaEnabled / totalUsers * 100, 1) : 0,
            HighRiskUsers = highRisk,
            PendingAccessRequests = snapshots.Sum(s => s.AccessRequestCount)
        };
    }

    private List<AuthenticationTrendItemDto> BuildAuthenticationTrend(
        IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots,
        int days)
    {
        var trend = new List<AuthenticationTrendItemDto>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        for (int i = days - 1; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var daySnapshots = snapshots.Where(s => s.Date == date).ToList();

            var dayOfWeek = date.DayOfWeek;
            var dayName = dayOfWeek switch
            {
                DayOfWeek.Sunday => "یکشنبه",
                DayOfWeek.Monday => "دوشنبه",
                DayOfWeek.Tuesday => "سه‌شنبه",
                DayOfWeek.Wednesday => "چهارشنبه",
                DayOfWeek.Thursday => "پنجشنبه",
                DayOfWeek.Friday => "جمعه",
                DayOfWeek.Saturday => "شنبه",
                _ => date.ToString("ddd")
            };

            trend.Add(new AuthenticationTrendItemDto
            {
                Date = date.ToString("MM/dd"),
                DayName = dayName,
                SuccessfulLogins = daySnapshots.Sum(s => s.TotalSignInCount - s.FailedSignInCount),
                FailedLogins = daySnapshots.Sum(s => s.FailedSignInCount),
                MfaChallenges = daySnapshots.Sum(s => s.HighRiskSignInCount), // Using high risk as proxy for MFA challenges
                UniqueUsers = daySnapshots.Sum(s => s.ActiveUsers)
            });
        }

        return trend;
    }

    private MfaDistributionDto BuildMfaDistribution(IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots)
    {
        var totalUsers = snapshots.Sum(s => s.TotalUsers);
        var mfaEnabled = snapshots.Sum(s => s.MfaEnabledUsers);
        var mfaDisabled = totalUsers - mfaEnabled;

        // Estimate MFA method breakdown (in real implementation, this would come from actual data)
        var methodBreakdown = new List<MfaMethodCountDto>();
        if (mfaEnabled > 0)
        {
            // Simulated distribution - in production this would come from actual MFA enrollment data
            var totpCount = (int)(mfaEnabled * 0.6);
            var emailCount = (int)(mfaEnabled * 0.25);
            var smsCount = (int)(mfaEnabled * 0.1);
            var fido2Count = mfaEnabled - totpCount - emailCount - smsCount;

            if (totpCount > 0)
                methodBreakdown.Add(new MfaMethodCountDto { Method = "TOTP", Count = totpCount, Percentage = Math.Round((decimal)totpCount / mfaEnabled * 100, 1) });
            if (emailCount > 0)
                methodBreakdown.Add(new MfaMethodCountDto { Method = "Email", Count = emailCount, Percentage = Math.Round((decimal)emailCount / mfaEnabled * 100, 1) });
            if (smsCount > 0)
                methodBreakdown.Add(new MfaMethodCountDto { Method = "SMS", Count = smsCount, Percentage = Math.Round((decimal)smsCount / mfaEnabled * 100, 1) });
            if (fido2Count > 0)
                methodBreakdown.Add(new MfaMethodCountDto { Method = "FIDO2", Count = fido2Count, Percentage = Math.Round((decimal)fido2Count / mfaEnabled * 100, 1) });
        }

        return new MfaDistributionDto
        {
            UsersWithMfa = mfaEnabled,
            UsersWithoutMfa = mfaDisabled,
            MfaAdoptionPercent = totalUsers > 0 ? Math.Round((decimal)mfaEnabled / totalUsers * 100, 1) : 0,
            MethodBreakdown = methodBreakdown
        };
    }

    private RiskDistributionDto BuildRiskDistribution(IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots)
    {
        var highRiskCount = 0;
        var mediumRiskCount = 0;
        var lowRiskCount = 0;

        foreach (var snapshot in snapshots)
        {
            var riskLevel = CalculateTenantRiskLevel(snapshot);
            switch (riskLevel)
            {
                case "High": highRiskCount++; break;
                case "Medium": mediumRiskCount++; break;
                default: lowRiskCount++; break;
            }
        }

        var totalHighRiskEvents = snapshots.Sum(s => s.HighRiskSignInCount);
        var totalFailedLogins = snapshots.Sum(s => s.FailedSignInCount);
        var totalEmergencyAccess = snapshots.Sum(s => s.EmergencyAccessCount);

        var eventBreakdown = new List<RiskEventTypeCountDto>
        {
            new() { EventType = "ورود پرخطر", Count = totalHighRiskEvents, Severity = "High" },
            new() { EventType = "ورود ناموفق", Count = totalFailedLogins, Severity = "Medium" },
            new() { EventType = "دسترسی اضطراری", Count = totalEmergencyAccess, Severity = "High" }
        };

        return new RiskDistributionDto
        {
            HighRiskCount = highRiskCount,
            MediumRiskCount = mediumRiskCount,
            LowRiskCount = lowRiskCount,
            NoRiskCount = snapshots.Count - highRiskCount - mediumRiskCount - lowRiskCount,
            EventTypeBreakdown = eventBreakdown.Where(e => e.Count > 0).ToList()
        };
    }

    private List<TopTenantDto> BuildTopTenants(
        IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots,
        int count)
    {
        return snapshots
            .OrderByDescending(s => s.TotalUsers)
            .Take(count)
            .Select(s => new TopTenantDto
            {
                TenantId = s.TenantId,
                TenantName = $"سازمان {s.TenantId.ToString()[..8]}", // In production, fetch actual tenant name
                UserCount = s.TotalUsers,
                ApplicationCount = s.TotalApplications,
                AuthenticationsToday = s.TotalSignInCount,
                MfaAdoptionPercent = s.TotalUsers > 0 ? Math.Round((decimal)s.MfaEnabledUsers / s.TotalUsers * 100, 1) : 0,
                RiskLevel = CalculateTenantRiskLevel(s)
            })
            .ToList();
    }

    private List<SecurityEventDto> BuildRecentSecurityEvents(
        IReadOnlyList<Domain.Entities.TenantDailyUsageSnapshot> snapshots,
        int count)
    {
        var events = new List<SecurityEventDto>();
        var now = DateTime.UtcNow;

        // Generate events based on snapshot data
        foreach (var snapshot in snapshots.OrderByDescending(s => s.HighRiskSignInCount).Take(count / 2))
        {
            if (snapshot.HighRiskSignInCount > 0)
            {
                events.Add(new SecurityEventDto
                {
                    Id = Guid.NewGuid(),
                    EventType = "ورود پرخطر",
                    Severity = "High",
                    Description = $"{snapshot.HighRiskSignInCount} ورود پرخطر شناسایی شد",
                    TenantName = $"سازمان {snapshot.TenantId.ToString()[..8]}",
                    UserEmail = "user@example.com",
                    IpAddress = "192.168.1.x",
                    Timestamp = now.AddMinutes(-Random.Shared.Next(1, 120))
                });
            }

            if (snapshot.FailedSignInCount > 5)
            {
                events.Add(new SecurityEventDto
                {
                    Id = Guid.NewGuid(),
                    EventType = "تلاش‌های ورود ناموفق",
                    Severity = "Medium",
                    Description = $"{snapshot.FailedSignInCount} تلاش ورود ناموفق",
                    TenantName = $"سازمان {snapshot.TenantId.ToString()[..8]}",
                    UserEmail = "user@example.com",
                    IpAddress = "10.0.0.x",
                    Timestamp = now.AddMinutes(-Random.Shared.Next(1, 180))
                });
            }

            if (snapshot.EmergencyAccessCount > 0)
            {
                events.Add(new SecurityEventDto
                {
                    Id = Guid.NewGuid(),
                    EventType = "دسترسی اضطراری",
                    Severity = "High",
                    Description = $"{snapshot.EmergencyAccessCount} دسترسی اضطراری استفاده شد",
                    TenantName = $"سازمان {snapshot.TenantId.ToString()[..8]}",
                    UserEmail = "admin@example.com",
                    IpAddress = "172.16.0.x",
                    Timestamp = now.AddMinutes(-Random.Shared.Next(1, 240))
                });
            }
        }

        return events
            .OrderByDescending(e => e.Timestamp)
            .Take(count)
            .ToList();
    }

    private static string CalculateTenantRiskLevel(Domain.Entities.TenantDailyUsageSnapshot snapshot)
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
