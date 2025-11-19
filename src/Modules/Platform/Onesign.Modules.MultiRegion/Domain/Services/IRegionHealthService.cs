using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface IRegionHealthService
{
    Task<IReadOnlyList<RegionHealthDto>> GetRegionsHealthAsync(CancellationToken cancellationToken = default);
    Task UpdateRegionHealthAsync(string regionId, CancellationToken cancellationToken = default);
}

public class RegionHealthDto
{
    public string RegionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? LastSuccessfulBackupAt { get; set; }
    public int TenantsCount { get; set; }
    public int CriticalAlertsCount { get; set; }
}
