using System.Text;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Services;

public class ExportService : IExportService
{
    private readonly ITenantDailyUsageSnapshotRepository _tenantSnapshotRepository;
    private readonly IApplicationDailyUsageSnapshotRepository _appSnapshotRepository;
    private readonly IUserSecurityPostureRepository _userPostureRepository;
    private readonly ILogger<ExportService> _logger;

    public ExportService(
        ITenantDailyUsageSnapshotRepository tenantSnapshotRepository,
        IApplicationDailyUsageSnapshotRepository appSnapshotRepository,
        IUserSecurityPostureRepository userPostureRepository,
        ILogger<ExportService> logger)
    {
        _tenantSnapshotRepository = tenantSnapshotRepository;
        _appSnapshotRepository = appSnapshotRepository;
        _userPostureRepository = userPostureRepository;
        _logger = logger;
    }

    public async Task<ExportResult> ExportTenantInsightsToCsvAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Exporting tenant insights for {TenantId} from {From} to {To}", tenantId, from, to);

            var snapshots = await _tenantSnapshotRepository.GetByTenantAndDateRangeAsync(tenantId, from, to, ct);

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("Date,TotalUsers,ActiveUsers,MfaEnabledUsers,MfaAdoptionPercent,TotalApplications,ApplicationsWithSSOEnabled,SsoCoveragePercent,TotalSignInCount,FailedSignInCount,HighRiskSignInCount,SignInSuccessRate,AccessRequestCount,AccessRequestApprovedCount,LifecycleEventsCount,EmergencyAccessCount");

            foreach (var snapshot in snapshots)
            {
                var mfaPercent = snapshot.TotalUsers > 0
                    ? Math.Round((decimal)snapshot.MfaEnabledUsers / snapshot.TotalUsers * 100, 2)
                    : 0;
                var ssoPercent = snapshot.TotalApplications > 0
                    ? Math.Round((decimal)snapshot.ApplicationsWithSSOEnabled / snapshot.TotalApplications * 100, 2)
                    : 0;
                var successRate = snapshot.TotalSignInCount > 0
                    ? Math.Round((decimal)(snapshot.TotalSignInCount - snapshot.FailedSignInCount) / snapshot.TotalSignInCount * 100, 2)
                    : 100;

                csvBuilder.AppendLine($"{snapshot.Date:yyyy-MM-dd},{snapshot.TotalUsers},{snapshot.ActiveUsers},{snapshot.MfaEnabledUsers},{mfaPercent},{snapshot.TotalApplications},{snapshot.ApplicationsWithSSOEnabled},{ssoPercent},{snapshot.TotalSignInCount},{snapshot.FailedSignInCount},{snapshot.HighRiskSignInCount},{successRate},{snapshot.AccessRequestCount},{snapshot.AccessRequestApprovedCount},{snapshot.LifecycleEventsCount},{snapshot.EmergencyAccessCount}");
            }

            var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

            _logger.LogInformation("Exported {Count} tenant insight records", snapshots.Count);

            return new ExportResult
            {
                Success = true,
                FileName = $"TenantInsights_{tenantId}_{from:yyyyMMdd}_{to:yyyyMMdd}.csv",
                Content = content,
                ContentType = "text/csv"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting tenant insights for {TenantId}", tenantId);
            return new ExportResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ExportResult> ExportApplicationUsageToCsvAsync(Guid tenantId, DateOnly date, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Exporting application usage for {TenantId} on {Date}", tenantId, date);

            var snapshots = await _appSnapshotRepository.GetByTenantAndDateAsync(tenantId, date, ct);

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("ApplicationId,Date,UniqueUsers,SignInCount,FailedSignInCount,HighRiskSignInCount,SuccessRate");

            foreach (var snapshot in snapshots)
            {
                var successRate = snapshot.SignInCount > 0
                    ? Math.Round((decimal)(snapshot.SignInCount - snapshot.FailedSignInCount) / snapshot.SignInCount * 100, 2)
                    : 100;

                csvBuilder.AppendLine($"{snapshot.ApplicationId},{snapshot.Date:yyyy-MM-dd},{snapshot.UniqueUsers},{snapshot.SignInCount},{snapshot.FailedSignInCount},{snapshot.HighRiskSignInCount},{successRate}");
            }

            var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

            _logger.LogInformation("Exported {Count} application usage records", snapshots.Count);

            return new ExportResult
            {
                Success = true,
                FileName = $"ApplicationUsage_{tenantId}_{date:yyyyMMdd}.csv",
                Content = content,
                ContentType = "text/csv"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting application usage for {TenantId}", tenantId);
            return new ExportResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ExportResult> ExportUserSecurityPostureToCsvAsync(Guid tenantId, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Exporting user security posture for {TenantId}", tenantId);

            var postures = await _userPostureRepository.GetByTenantIdAsync(tenantId, ct);

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("UserId,LastSignInAt,MfaEnabled,EnabledAppsCount,UsedAppsLast30DaysCount,HighRiskEventsLast30Days,IsAnonymized,RiskLevel,UpdatedAt");

            foreach (var posture in postures)
            {
                var riskLevel = CalculateRiskLevel(posture);
                var lastSignIn = posture.LastSignInAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Never";

                csvBuilder.AppendLine($"{posture.UserId},{lastSignIn},{posture.MfaEnabled},{posture.EnabledAppsCount},{posture.UsedAppsLast30DaysCount},{posture.HighRiskEventsLast30Days},{posture.IsAnonymized},{riskLevel},{posture.UpdatedAt:yyyy-MM-dd HH:mm:ss}");
            }

            var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

            _logger.LogInformation("Exported {Count} user security posture records", postures.Count);

            return new ExportResult
            {
                Success = true,
                FileName = $"UserSecurityPosture_{tenantId}_{DateTime.UtcNow:yyyyMMdd}.csv",
                Content = content,
                ContentType = "text/csv"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting user security posture for {TenantId}", tenantId);
            return new ExportResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ExportResult> ExportGlobalOverviewToCsvAsync(DateOnly date, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Exporting global overview for {Date}", date);

            var snapshots = await _tenantSnapshotRepository.GetAllByDateAsync(date, ct);

            if (snapshots.Count == 0)
            {
                snapshots = await _tenantSnapshotRepository.GetLatestByTenantsAsync(7, ct);
            }

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("TenantId,Date,TotalUsers,ActiveUsers,MfaEnabledUsers,MfaAdoptionPercent,TotalApplications,ApplicationsWithSSOEnabled,SsoCoveragePercent,TotalSignInCount,FailedSignInCount,HighRiskSignInCount,SignInSuccessRate,AccessRequestCount,LifecycleEventsCount,EmergencyAccessCount,RiskLevel");

            foreach (var snapshot in snapshots)
            {
                var mfaPercent = snapshot.TotalUsers > 0
                    ? Math.Round((decimal)snapshot.MfaEnabledUsers / snapshot.TotalUsers * 100, 2)
                    : 0;
                var ssoPercent = snapshot.TotalApplications > 0
                    ? Math.Round((decimal)snapshot.ApplicationsWithSSOEnabled / snapshot.TotalApplications * 100, 2)
                    : 0;
                var successRate = snapshot.TotalSignInCount > 0
                    ? Math.Round((decimal)(snapshot.TotalSignInCount - snapshot.FailedSignInCount) / snapshot.TotalSignInCount * 100, 2)
                    : 100;
                var riskLevel = CalculateTenantRiskLevel(snapshot);

                csvBuilder.AppendLine($"{snapshot.TenantId},{snapshot.Date:yyyy-MM-dd},{snapshot.TotalUsers},{snapshot.ActiveUsers},{snapshot.MfaEnabledUsers},{mfaPercent},{snapshot.TotalApplications},{snapshot.ApplicationsWithSSOEnabled},{ssoPercent},{snapshot.TotalSignInCount},{snapshot.FailedSignInCount},{snapshot.HighRiskSignInCount},{successRate},{snapshot.AccessRequestCount},{snapshot.LifecycleEventsCount},{snapshot.EmergencyAccessCount},{riskLevel}");
            }

            var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

            _logger.LogInformation("Exported {Count} global overview records", snapshots.Count);

            return new ExportResult
            {
                Success = true,
                FileName = $"GlobalOverview_{date:yyyyMMdd}.csv",
                Content = content,
                ContentType = "text/csv"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting global overview for {Date}", date);
            return new ExportResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    private static string CalculateRiskLevel(UserSecurityPosture posture)
    {
        if (posture.HighRiskEventsLast30Days >= 5 || (!posture.MfaEnabled && posture.HighRiskEventsLast30Days >= 2))
            return "High";
        if (posture.HighRiskEventsLast30Days >= 2 || !posture.MfaEnabled)
            return "Medium";
        return "Low";
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
