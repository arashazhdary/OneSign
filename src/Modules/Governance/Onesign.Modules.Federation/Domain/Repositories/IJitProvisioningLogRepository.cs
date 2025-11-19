using Onesign.Modules.Federation.Domain.Entities;

namespace Onesign.Modules.Federation.Domain.Repositories;

public interface IJitProvisioningLogRepository
{
    Task<JitProvisioningLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<JitProvisioningLog>> GetByTenantIdAsync(Guid tenantId, int skip, int take, CancellationToken cancellationToken = default);
    Task<List<JitProvisioningLog>> GetByUserIdAsync(Guid tenantId, string userId, CancellationToken cancellationToken = default);
    Task<JitProvisioningLog> AddAsync(JitProvisioningLog log, CancellationToken cancellationToken = default);
}
