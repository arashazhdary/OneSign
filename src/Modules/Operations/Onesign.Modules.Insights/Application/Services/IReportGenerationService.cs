using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Application.Services;

public interface IReportGenerationService
{
    Task<ReportGenerationResult> GenerateReportAsync(ReportType reportType, Guid? scopeId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<int> ProcessScheduledReportsAsync(CancellationToken ct = default);
    Task SendReportAsync(ReportSubscription subscription, byte[] reportContent, string fileName, CancellationToken ct = default);
}

public class ReportGenerationResult
{
    public bool Success { get; set; }
    public string ReportName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}
