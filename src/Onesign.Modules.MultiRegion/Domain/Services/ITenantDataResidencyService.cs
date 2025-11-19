using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface ITenantDataResidencyService
{
    Task<TenantDataResidency> GetTenantDataResidencyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantDataResidency> SetTenantDataResidencyAsync(SetDataResidencyRequest request, CancellationToken cancellationToken = default);
    Task<DataResidencyMigrationResult> MigrateTenantToRegionAsync(MigrateTenantRequest request, CancellationToken cancellationToken = default);
    Task<DataResidencyMigrationStatus> GetMigrationStatusAsync(Guid migrationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DataResidencyPolicy>> GetDataResidencyPoliciesAsync(CancellationToken cancellationToken = default);
    Task<DataResidencyPolicy> CreateDataResidencyPolicyAsync(CreateDataResidencyPolicyRequest request, CancellationToken cancellationToken = default);
    Task<bool> ValidateDataResidencyComplianceAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DataResidencyViolation>> GetDataResidencyViolationsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public class SetDataResidencyRequest
{
    public Guid TenantId { get; set; }
    public string PrimaryRegionId { get; set; } = string.Empty;
    public List<string>? AllowedRegions { get; set; }
    public DataResidencyRequirements? Requirements { get; set; }
}

public class DataResidencyRequirements
{
    public bool DataSovereignty { get; set; } = false;
    public bool StrictLocality { get; set; } = false;
    public List<string> RestrictedCountries { get; set; } = new();
    public string? ComplianceStandard { get; set; }
}

public class MigrateTenantRequest
{
    public Guid TenantId { get; set; }
    public string TargetRegionId { get; set; } = string.Empty;
    public bool KeepSourceCopy { get; set; } = false;
    public DateTime? ScheduledAt { get; set; }
    public string? Reason { get; set; }
}

public class DataResidencyMigrationResult
{
    public Guid MigrationId { get; set; }
    public Guid TenantId { get; set; }
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime InitiatedAt { get; set; }
    public string? ErrorMessage { get; set; }
}

public class DataResidencyMigrationStatus
{
    public Guid MigrationId { get; set; }
    public Guid TenantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public string CurrentPhase { get; set; } = string.Empty;
    public DateTime InitiatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public long DataTransferredBytes { get; set; }
    public long TotalDataBytes { get; set; }
    public string? ErrorMessage { get; set; }
}

public class DataResidencyPolicy
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> AllowedRegions { get; set; } = new();
    public List<string> RequiredRegions { get; set; } = new();
    public string? ComplianceStandard { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDataResidencyPolicyRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> AllowedRegions { get; set; } = new();
    public List<string> RequiredRegions { get; set; } = new();
    public string? ComplianceStandard { get; set; }
}

public class DataResidencyViolation
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string ViolationType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public bool IsResolved { get; set; }
    public string? Resolution { get; set; }
}
