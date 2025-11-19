using Onesign.Modules.Privacy.Domain.Entities;

namespace Onesign.Modules.Privacy.Domain.Services;

public interface IDataRetentionService
{
    Task<IEnumerable<DataRetentionPolicy>> GetPoliciesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task ExecuteCleanupAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
