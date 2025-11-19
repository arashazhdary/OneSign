namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface IFailoverService
{
    Task<FailoverResult> InitiateFailoverAsync(FailoverRequest request, CancellationToken cancellationToken = default);
    Task<FailoverStatus> GetFailoverStatusAsync(Guid failoverId, CancellationToken cancellationToken = default);
    Task<bool> CancelFailoverAsync(Guid failoverId, CancellationToken cancellationToken = default);
    Task<FailoverResult> InitiateFailbackAsync(Guid failoverId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FailoverEvent>> GetFailoverHistoryAsync(string regionId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<FailoverReadinessCheck> CheckFailoverReadinessAsync(string sourceRegionId, string targetRegionId, CancellationToken cancellationToken = default);
    Task<DrTestResult> RunDrTestAsync(DrTestRequest request, CancellationToken cancellationToken = default);
}

public class FailoverRequest
{
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public FailoverType FailoverType { get; set; } = FailoverType.Planned;
    public bool AutoFailback { get; set; } = false;
    public TimeSpan? FailbackDelay { get; set; }
    public string? Reason { get; set; }
    public List<Guid>? TenantIds { get; set; }
}

public enum FailoverType
{
    Planned,
    Unplanned,
    Test
}

public class FailoverResult
{
    public Guid FailoverId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime InitiatedAt { get; set; }
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

public class FailoverStatus
{
    public Guid FailoverId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public DateTime InitiatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int TenantsMigrated { get; set; }
    public int TotalTenants { get; set; }
    public string CurrentPhase { get; set; } = string.Empty;
    public List<string> CompletedPhases { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

public class FailoverEvent
{
    public Guid Id { get; set; }
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public FailoverType Type { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime InitiatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? InitiatedBy { get; set; }
    public int TenantsAffected { get; set; }
    public string? Reason { get; set; }
}

public class FailoverReadinessCheck
{
    public bool IsReady { get; set; }
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public List<ReadinessCheckItem> Checks { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> Blockers { get; set; } = new();
}

public class ReadinessCheckItem
{
    public string Name { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public string? Message { get; set; }
}

public class DrTestRequest
{
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public bool SimulateOnly { get; set; } = true;
    public List<Guid>? TestTenantIds { get; set; }
}

public class DrTestResult
{
    public Guid TestId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ExecutedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public List<DrTestStep> Steps { get; set; } = new();
    public bool Success { get; set; }
    public string? Summary { get; set; }
}

public class DrTestStep
{
    public string Name { get; set; } = string.Empty;
    public bool Success { get; set; }
    public TimeSpan Duration { get; set; }
    public string? Message { get; set; }
}
