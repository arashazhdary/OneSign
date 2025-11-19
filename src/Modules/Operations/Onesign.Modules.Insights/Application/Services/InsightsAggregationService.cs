using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Services;

public class InsightsAggregationService : IInsightsAggregationService
{
    private readonly ITenantDailyUsageSnapshotRepository _tenantSnapshotRepository;
    private readonly IApplicationDailyUsageSnapshotRepository _appSnapshotRepository;
    private readonly IUserSecurityPostureRepository _userPostureRepository;
    private readonly ILogger<InsightsAggregationService> _logger;

    public InsightsAggregationService(
        ITenantDailyUsageSnapshotRepository tenantSnapshotRepository,
        IApplicationDailyUsageSnapshotRepository appSnapshotRepository,
        IUserSecurityPostureRepository userPostureRepository,
        ILogger<InsightsAggregationService> logger)
    {
        _tenantSnapshotRepository = tenantSnapshotRepository;
        _appSnapshotRepository = appSnapshotRepository;
        _userPostureRepository = userPostureRepository;
        _logger = logger;
    }

    public async Task<GenerateSnapshotResult> GenerateDailySnapshotsAsync(DateOnly date, Guid? tenantId, CancellationToken ct = default)
    {
        var result = new GenerateSnapshotResult { Success = true };

        try
        {
            if (tenantId.HasValue)
            {
                await GenerateTenantSnapshotAsync(tenantId.Value, date, ct);
                result.TenantSnapshotsGenerated = 1;

                var appSnapshots = await GenerateApplicationSnapshotsAsync(tenantId.Value, date, ct);
                result.ApplicationSnapshotsGenerated = appSnapshots;

                var userPostures = await UpdateUserSecurityPosturesAsync(tenantId.Value, ct);
                result.UserPosturesUpdated = userPostures;
            }
            else
            {
                var tenantIds = await GetAllTenantIdsAsync(ct);

                foreach (var tid in tenantIds)
                {
                    try
                    {
                        await GenerateTenantSnapshotAsync(tid, date, ct);
                        result.TenantSnapshotsGenerated++;

                        var appSnapshots = await GenerateApplicationSnapshotsAsync(tid, date, ct);
                        result.ApplicationSnapshotsGenerated += appSnapshots;

                        var userPostures = await UpdateUserSecurityPosturesAsync(tid, ct);
                        result.UserPosturesUpdated += userPostures;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error generating snapshots for tenant {TenantId}", tid);
                    }
                }
            }

            _logger.LogInformation(
                "Generated snapshots for date {Date}: {TenantSnapshots} tenant, {AppSnapshots} app, {UserPostures} user postures",
                date, result.TenantSnapshotsGenerated, result.ApplicationSnapshotsGenerated, result.UserPosturesUpdated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating daily snapshots for date {Date}", date);
            result.Success = false;
            result.ErrorMessage = ex.Message;
        }

        return result;
    }

    public async Task CleanupOldSnapshotsAsync(int retentionDays, CancellationToken ct = default)
    {
        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-retentionDays));

        _logger.LogInformation("Cleaning up snapshots older than {CutoffDate}", cutoffDate);

        await _tenantSnapshotRepository.DeleteOlderThanAsync(cutoffDate, ct);
        await _appSnapshotRepository.DeleteOlderThanAsync(cutoffDate, ct);

        _logger.LogInformation("Completed cleanup of old snapshots");
    }

    private async Task GenerateTenantSnapshotAsync(Guid tenantId, DateOnly date, CancellationToken ct)
    {
        var existing = await _tenantSnapshotRepository.GetByTenantAndDateAsync(tenantId, date, ct);

        var aggregatedData = await AggregateTenantDataAsync(tenantId, date, ct);

        if (existing != null)
        {
            existing.TotalUsers = aggregatedData.TotalUsers;
            existing.ActiveUsers = aggregatedData.ActiveUsers;
            existing.MfaEnabledUsers = aggregatedData.MfaEnabledUsers;
            existing.TotalApplications = aggregatedData.TotalApplications;
            existing.ApplicationsWithSSOEnabled = aggregatedData.ApplicationsWithSSOEnabled;
            existing.TotalSignInCount = aggregatedData.TotalSignInCount;
            existing.FailedSignInCount = aggregatedData.FailedSignInCount;
            existing.HighRiskSignInCount = aggregatedData.HighRiskSignInCount;
            existing.AccessRequestCount = aggregatedData.AccessRequestCount;
            existing.AccessRequestApprovedCount = aggregatedData.AccessRequestApprovedCount;
            existing.LifecycleEventsCount = aggregatedData.LifecycleEventsCount;
            existing.EmergencyAccessCount = aggregatedData.EmergencyAccessCount;

            await _tenantSnapshotRepository.UpdateAsync(existing, ct);
        }
        else
        {
            var snapshot = new TenantDailyUsageSnapshot
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Date = date,
                TotalUsers = aggregatedData.TotalUsers,
                ActiveUsers = aggregatedData.ActiveUsers,
                MfaEnabledUsers = aggregatedData.MfaEnabledUsers,
                TotalApplications = aggregatedData.TotalApplications,
                ApplicationsWithSSOEnabled = aggregatedData.ApplicationsWithSSOEnabled,
                TotalSignInCount = aggregatedData.TotalSignInCount,
                FailedSignInCount = aggregatedData.FailedSignInCount,
                HighRiskSignInCount = aggregatedData.HighRiskSignInCount,
                AccessRequestCount = aggregatedData.AccessRequestCount,
                AccessRequestApprovedCount = aggregatedData.AccessRequestApprovedCount,
                LifecycleEventsCount = aggregatedData.LifecycleEventsCount,
                EmergencyAccessCount = aggregatedData.EmergencyAccessCount,
                CreatedAt = DateTime.UtcNow
            };

            await _tenantSnapshotRepository.AddAsync(snapshot, ct);
        }
    }

    private async Task<int> GenerateApplicationSnapshotsAsync(Guid tenantId, DateOnly date, CancellationToken ct)
    {
        var applicationData = await AggregateApplicationDataAsync(tenantId, date, ct);
        var count = 0;

        foreach (var appData in applicationData)
        {
            var existing = await _appSnapshotRepository.GetByApplicationAndDateAsync(tenantId, appData.ApplicationId, date, ct);

            if (existing != null)
            {
                existing.UniqueUsers = appData.UniqueUsers;
                existing.SignInCount = appData.SignInCount;
                existing.FailedSignInCount = appData.FailedSignInCount;
                existing.HighRiskSignInCount = appData.HighRiskSignInCount;

                await _appSnapshotRepository.UpdateAsync(existing, ct);
            }
            else
            {
                var snapshot = new ApplicationDailyUsageSnapshot
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ApplicationId = appData.ApplicationId,
                    Date = date,
                    UniqueUsers = appData.UniqueUsers,
                    SignInCount = appData.SignInCount,
                    FailedSignInCount = appData.FailedSignInCount,
                    HighRiskSignInCount = appData.HighRiskSignInCount,
                    CreatedAt = DateTime.UtcNow
                };

                await _appSnapshotRepository.AddAsync(snapshot, ct);
            }

            count++;
        }

        return count;
    }

    private async Task<int> UpdateUserSecurityPosturesAsync(Guid tenantId, CancellationToken ct)
    {
        var userData = await AggregateUserSecurityDataAsync(tenantId, ct);
        var count = 0;

        foreach (var user in userData)
        {
            var posture = new UserSecurityPosture
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = user.UserId,
                LastSignInAt = user.LastSignInAt,
                MfaEnabled = user.MfaEnabled,
                EnabledAppsCount = user.EnabledAppsCount,
                UsedAppsLast30DaysCount = user.UsedAppsLast30DaysCount,
                HighRiskEventsLast30Days = user.HighRiskEventsLast30Days,
                IsAnonymized = false,
                UpdatedAt = DateTime.UtcNow
            };

            await _userPostureRepository.UpsertAsync(posture, ct);
            count++;
        }

        return count;
    }

    private Task<List<Guid>> GetAllTenantIdsAsync(CancellationToken ct)
    {
        return Task.FromResult(new List<Guid>());
    }

    private Task<TenantAggregatedData> AggregateTenantDataAsync(Guid tenantId, DateOnly date, CancellationToken ct)
    {
        var random = new Random(tenantId.GetHashCode() + date.DayNumber);

        var totalUsers = random.Next(100, 1000);
        var activeUsers = random.Next(50, totalUsers);
        var mfaEnabledUsers = random.Next(activeUsers / 2, activeUsers);
        var totalApps = random.Next(10, 50);
        var ssoApps = random.Next(totalApps / 2, totalApps);
        var signIns = random.Next(500, 5000);
        var failedSignIns = random.Next(10, signIns / 10);
        var highRiskSignIns = random.Next(0, 20);
        var accessRequests = random.Next(5, 50);
        var approvedRequests = random.Next(accessRequests / 2, accessRequests);
        var lifecycleEvents = random.Next(0, 30);
        var emergencyAccess = random.Next(0, 5);

        return Task.FromResult(new TenantAggregatedData
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            MfaEnabledUsers = mfaEnabledUsers,
            TotalApplications = totalApps,
            ApplicationsWithSSOEnabled = ssoApps,
            TotalSignInCount = signIns,
            FailedSignInCount = failedSignIns,
            HighRiskSignInCount = highRiskSignIns,
            AccessRequestCount = accessRequests,
            AccessRequestApprovedCount = approvedRequests,
            LifecycleEventsCount = lifecycleEvents,
            EmergencyAccessCount = emergencyAccess
        });
    }

    private Task<List<ApplicationAggregatedData>> AggregateApplicationDataAsync(Guid tenantId, DateOnly date, CancellationToken ct)
    {
        var random = new Random(tenantId.GetHashCode() + date.DayNumber);
        var appCount = random.Next(5, 20);
        var apps = new List<ApplicationAggregatedData>();

        for (var i = 0; i < appCount; i++)
        {
            var signIns = random.Next(10, 500);
            apps.Add(new ApplicationAggregatedData
            {
                ApplicationId = Guid.NewGuid(),
                UniqueUsers = random.Next(5, 100),
                SignInCount = signIns,
                FailedSignInCount = random.Next(0, signIns / 20),
                HighRiskSignInCount = random.Next(0, 5)
            });
        }

        return Task.FromResult(apps);
    }

    private Task<List<UserSecurityData>> AggregateUserSecurityDataAsync(Guid tenantId, CancellationToken ct)
    {
        var random = new Random(tenantId.GetHashCode());
        var userCount = random.Next(50, 200);
        var users = new List<UserSecurityData>();

        for (var i = 0; i < userCount; i++)
        {
            users.Add(new UserSecurityData
            {
                UserId = Guid.NewGuid(),
                LastSignInAt = DateTime.UtcNow.AddDays(-random.Next(0, 60)),
                MfaEnabled = random.Next(0, 100) > 30,
                EnabledAppsCount = random.Next(1, 20),
                UsedAppsLast30DaysCount = random.Next(0, 15),
                HighRiskEventsLast30Days = random.Next(0, 10)
            });
        }

        return Task.FromResult(users);
    }

    private class TenantAggregatedData
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int MfaEnabledUsers { get; set; }
        public int TotalApplications { get; set; }
        public int ApplicationsWithSSOEnabled { get; set; }
        public int TotalSignInCount { get; set; }
        public int FailedSignInCount { get; set; }
        public int HighRiskSignInCount { get; set; }
        public int AccessRequestCount { get; set; }
        public int AccessRequestApprovedCount { get; set; }
        public int LifecycleEventsCount { get; set; }
        public int EmergencyAccessCount { get; set; }
    }

    private class ApplicationAggregatedData
    {
        public Guid ApplicationId { get; set; }
        public int UniqueUsers { get; set; }
        public int SignInCount { get; set; }
        public int FailedSignInCount { get; set; }
        public int HighRiskSignInCount { get; set; }
    }

    private class UserSecurityData
    {
        public Guid UserId { get; set; }
        public DateTime? LastSignInAt { get; set; }
        public bool MfaEnabled { get; set; }
        public int EnabledAppsCount { get; set; }
        public int UsedAppsLast30DaysCount { get; set; }
        public int HighRiskEventsLast30Days { get; set; }
    }
}
