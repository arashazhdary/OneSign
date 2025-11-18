using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Repositories;

public interface IAccessRequestRepository
{
    Task<AccessRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AccessRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AccessRequest>> GetByRequesterAsync(Guid tenantId, Guid requesterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AccessRequest>> GetPendingForApproverAsync(Guid tenantId, Guid approverId, CancellationToken cancellationToken = default);
    Task AddAsync(AccessRequest request, CancellationToken cancellationToken = default);
    Task UpdateAsync(AccessRequest request, CancellationToken cancellationToken = default);
}
