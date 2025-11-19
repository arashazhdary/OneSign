namespace Onesign.Modules.Insights.Application.Services;

public interface IExportService
{
    Task<ExportResult> ExportTenantInsightsToCsvAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<ExportResult> ExportApplicationUsageToCsvAsync(Guid tenantId, DateOnly date, CancellationToken ct = default);
    Task<ExportResult> ExportUserSecurityPostureToCsvAsync(Guid tenantId, CancellationToken ct = default);
    Task<ExportResult> ExportGlobalOverviewToCsvAsync(DateOnly date, CancellationToken ct = default);
}

public class ExportResult
{
    public bool Success { get; set; }
    public string FileName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "text/csv";
    public string? ErrorMessage { get; set; }
}
