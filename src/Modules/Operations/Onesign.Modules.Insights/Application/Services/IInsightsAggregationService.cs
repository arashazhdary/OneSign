using Onesign.Modules.Insights.Application.Commands;

namespace Onesign.Modules.Insights.Application.Services;

public interface IInsightsAggregationService
{
    Task<GenerateSnapshotResult> GenerateDailySnapshotsAsync(DateOnly date, Guid? tenantId, CancellationToken ct = default);
    Task CleanupOldSnapshotsAsync(int retentionDays, CancellationToken ct = default);
}
