using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Services;

public class ReportGenerationService : IReportGenerationService
{
    private readonly ITenantDailyUsageSnapshotRepository _tenantSnapshotRepository;
    private readonly IApplicationDailyUsageSnapshotRepository _appSnapshotRepository;
    private readonly IUserSecurityPostureRepository _userPostureRepository;
    private readonly IReportSubscriptionRepository _subscriptionRepository;
    private readonly IExportService _exportService;
    private readonly ILogger<ReportGenerationService> _logger;

    public ReportGenerationService(
        ITenantDailyUsageSnapshotRepository tenantSnapshotRepository,
        IApplicationDailyUsageSnapshotRepository appSnapshotRepository,
        IUserSecurityPostureRepository userPostureRepository,
        IReportSubscriptionRepository subscriptionRepository,
        IExportService exportService,
        ILogger<ReportGenerationService> logger)
    {
        _tenantSnapshotRepository = tenantSnapshotRepository;
        _appSnapshotRepository = appSnapshotRepository;
        _userPostureRepository = userPostureRepository;
        _subscriptionRepository = subscriptionRepository;
        _exportService = exportService;
        _logger = logger;
    }

    public async Task<ReportGenerationResult> GenerateReportAsync(ReportType reportType, Guid? scopeId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Generating {ReportType} report for scope {ScopeId} from {From} to {To}", reportType, scopeId, from, to);

            var result = reportType switch
            {
                ReportType.TenantSecuritySummary => await GenerateTenantSecuritySummaryAsync(scopeId!.Value, from, to, ct),
                ReportType.TenantUsageSummary => await GenerateTenantUsageSummaryAsync(scopeId!.Value, from, to, ct),
                ReportType.GlobalTenantsOverview => await GenerateGlobalTenantsOverviewAsync(from, to, ct),
                ReportType.UserSecurityPosture => await GenerateUserSecurityPostureReportAsync(scopeId!.Value, ct),
                _ => new ReportGenerationResult { Success = false, ErrorMessage = $"Unknown report type: {reportType}" }
            };

            _logger.LogInformation("Generated report {ReportName} with {ContentLength} bytes", result.ReportName, result.Content.Length);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating {ReportType} report", reportType);
            return new ReportGenerationResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<int> ProcessScheduledReportsAsync(CancellationToken ct = default)
    {
        var activeSubscriptions = await _subscriptionRepository.GetActiveSubscriptionsAsync(ct);
        var processedCount = 0;

        foreach (var subscription in activeSubscriptions)
        {
            if (ShouldRunReport(subscription))
            {
                try
                {
                    var to = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
                    var from = GetReportStartDate(subscription.CronOrFrequency, to);

                    var result = await GenerateReportAsync(subscription.ReportType, subscription.ScopeId, from, to, ct);

                    if (result.Success)
                    {
                        await SendReportAsync(subscription, result.Content, result.ReportName, ct);
                        processedCount++;
                    }
                    else
                    {
                        _logger.LogWarning("Failed to generate report for subscription {SubscriptionId}: {Error}", subscription.Id, result.ErrorMessage);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing scheduled report for subscription {SubscriptionId}", subscription.Id);
                }
            }
        }

        _logger.LogInformation("Processed {Count} scheduled reports", processedCount);
        return processedCount;
    }

    public async Task SendReportAsync(ReportSubscription subscription, byte[] reportContent, string fileName, CancellationToken ct = default)
    {
        var recipients = subscription.EmailRecipients.Split(';', StringSplitOptions.RemoveEmptyEntries);

        foreach (var recipient in recipients)
        {
            _logger.LogInformation("Sending report {FileName} to {Recipient}", fileName, recipient);
        }

        await Task.CompletedTask;
    }

    private async Task<ReportGenerationResult> GenerateTenantSecuritySummaryAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct)
    {
        var snapshots = await _tenantSnapshotRepository.GetByTenantAndDateRangeAsync(tenantId, from, to, ct);
        var userPostures = await _userPostureRepository.GetByTenantIdAsync(tenantId, ct);

        var reportData = new
        {
            TenantId = tenantId,
            ReportPeriod = new { From = from.ToString("yyyy-MM-dd"), To = to.ToString("yyyy-MM-dd") },
            GeneratedAt = DateTime.UtcNow,
            Summary = new
            {
                TotalUsers = snapshots.LastOrDefault()?.TotalUsers ?? 0,
                MfaEnabledUsers = snapshots.LastOrDefault()?.MfaEnabledUsers ?? 0,
                MfaAdoptionPercent = snapshots.LastOrDefault()?.TotalUsers > 0
                    ? Math.Round((decimal)(snapshots.LastOrDefault()?.MfaEnabledUsers ?? 0) / snapshots.LastOrDefault()!.TotalUsers * 100, 2)
                    : 0,
                HighRiskSignIns = snapshots.Sum(s => s.HighRiskSignInCount),
                FailedSignIns = snapshots.Sum(s => s.FailedSignInCount),
                EmergencyAccessEvents = snapshots.Sum(s => s.EmergencyAccessCount),
                HighRiskUsers = userPostures.Count(u => u.HighRiskEventsLast30Days >= 5),
                UsersWithoutMfa = userPostures.Count(u => !u.MfaEnabled)
            },
            DailySnapshots = snapshots.Select(s => new
            {
                s.Date,
                s.TotalUsers,
                s.ActiveUsers,
                s.MfaEnabledUsers,
                s.HighRiskSignInCount,
                s.FailedSignInCount,
                s.EmergencyAccessCount
            })
        };

        var json = JsonSerializer.Serialize(reportData, new JsonSerializerOptions { WriteIndented = true });
        var content = Encoding.UTF8.GetBytes(json);

        return new ReportGenerationResult
        {
            Success = true,
            ReportName = $"TenantSecuritySummary_{tenantId}_{from:yyyyMMdd}_{to:yyyyMMdd}.json",
            Content = content,
            ContentType = "application/json"
        };
    }

    private async Task<ReportGenerationResult> GenerateTenantUsageSummaryAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct)
    {
        var snapshots = await _tenantSnapshotRepository.GetByTenantAndDateRangeAsync(tenantId, from, to, ct);

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Date,TotalUsers,ActiveUsers,TotalSignIns,FailedSignIns,AccessRequests,ApprovedRequests,LifecycleEvents");

        foreach (var snapshot in snapshots)
        {
            csvBuilder.AppendLine($"{snapshot.Date:yyyy-MM-dd},{snapshot.TotalUsers},{snapshot.ActiveUsers},{snapshot.TotalSignInCount},{snapshot.FailedSignInCount},{snapshot.AccessRequestCount},{snapshot.AccessRequestApprovedCount},{snapshot.LifecycleEventsCount}");
        }

        var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

        return new ReportGenerationResult
        {
            Success = true,
            ReportName = $"TenantUsageSummary_{tenantId}_{from:yyyyMMdd}_{to:yyyyMMdd}.csv",
            Content = content,
            ContentType = "text/csv"
        };
    }

    private async Task<ReportGenerationResult> GenerateGlobalTenantsOverviewAsync(DateOnly from, DateOnly to, CancellationToken ct)
    {
        var snapshots = await _tenantSnapshotRepository.GetAllByDateAsync(to, ct);

        if (snapshots.Count == 0)
        {
            snapshots = await _tenantSnapshotRepository.GetLatestByTenantsAsync(7, ct);
        }

        var reportData = new
        {
            ReportPeriod = new { From = from.ToString("yyyy-MM-dd"), To = to.ToString("yyyy-MM-dd") },
            GeneratedAt = DateTime.UtcNow,
            Summary = new
            {
                TotalTenants = snapshots.Select(s => s.TenantId).Distinct().Count(),
                TotalUsers = snapshots.Sum(s => s.TotalUsers),
                TotalActiveUsers = snapshots.Sum(s => s.ActiveUsers),
                TotalSignIns = snapshots.Sum(s => s.TotalSignInCount),
                TotalFailedSignIns = snapshots.Sum(s => s.FailedSignInCount),
                TotalHighRiskSignIns = snapshots.Sum(s => s.HighRiskSignInCount),
                AverageMfaAdoption = snapshots.Count > 0 && snapshots.Sum(s => s.TotalUsers) > 0
                    ? Math.Round((decimal)snapshots.Sum(s => s.MfaEnabledUsers) / snapshots.Sum(s => s.TotalUsers) * 100, 2)
                    : 0
            },
            Tenants = snapshots.GroupBy(s => s.TenantId).Select(g =>
            {
                var latest = g.OrderByDescending(s => s.Date).First();
                return new
                {
                    TenantId = g.Key,
                    latest.TotalUsers,
                    latest.ActiveUsers,
                    latest.MfaEnabledUsers,
                    MfaAdoptionPercent = latest.TotalUsers > 0
                        ? Math.Round((decimal)latest.MfaEnabledUsers / latest.TotalUsers * 100, 2)
                        : 0,
                    latest.TotalSignInCount,
                    latest.FailedSignInCount,
                    latest.HighRiskSignInCount
                };
            })
        };

        var json = JsonSerializer.Serialize(reportData, new JsonSerializerOptions { WriteIndented = true });
        var content = Encoding.UTF8.GetBytes(json);

        return new ReportGenerationResult
        {
            Success = true,
            ReportName = $"GlobalTenantsOverview_{from:yyyyMMdd}_{to:yyyyMMdd}.json",
            Content = content,
            ContentType = "application/json"
        };
    }

    private async Task<ReportGenerationResult> GenerateUserSecurityPostureReportAsync(Guid tenantId, CancellationToken ct)
    {
        var postures = await _userPostureRepository.GetByTenantIdAsync(tenantId, ct);

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("UserId,LastSignInAt,MfaEnabled,EnabledAppsCount,UsedAppsLast30Days,HighRiskEventsLast30Days,RiskLevel");

        foreach (var posture in postures)
        {
            var riskLevel = CalculateRiskLevel(posture);
            csvBuilder.AppendLine($"{posture.UserId},{posture.LastSignInAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Never"},{posture.MfaEnabled},{posture.EnabledAppsCount},{posture.UsedAppsLast30DaysCount},{posture.HighRiskEventsLast30Days},{riskLevel}");
        }

        var content = Encoding.UTF8.GetBytes(csvBuilder.ToString());

        return new ReportGenerationResult
        {
            Success = true,
            ReportName = $"UserSecurityPosture_{tenantId}_{DateTime.UtcNow:yyyyMMdd}.csv",
            Content = content,
            ContentType = "text/csv"
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

    private static bool ShouldRunReport(ReportSubscription subscription)
    {
        var now = DateTime.UtcNow;

        if (subscription.CronOrFrequency.Equals("Daily", StringComparison.OrdinalIgnoreCase))
        {
            return now.Hour == 6;
        }

        if (subscription.CronOrFrequency.Equals("Weekly", StringComparison.OrdinalIgnoreCase))
        {
            return now.DayOfWeek == DayOfWeek.Monday && now.Hour == 6;
        }

        if (subscription.CronOrFrequency.Equals("Monthly", StringComparison.OrdinalIgnoreCase))
        {
            return now.Day == 1 && now.Hour == 6;
        }

        return false;
    }

    private static DateOnly GetReportStartDate(string frequency, DateOnly to)
    {
        return frequency.ToLowerInvariant() switch
        {
            "daily" => to,
            "weekly" => to.AddDays(-7),
            "monthly" => to.AddMonths(-1),
            _ => to.AddDays(-7)
        };
    }
}
