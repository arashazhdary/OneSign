using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Repositories;

public interface IAccessApprovalFlowRepository
{
    Task<AccessApprovalFlow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AccessApprovalFlow>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<AccessApprovalFlow?> GetByAccessTypeAsync(Guid tenantId, string accessType, CancellationToken cancellationToken = default);
    Task AddAsync(AccessApprovalFlow flow, CancellationToken cancellationToken = default);
    Task UpdateAsync(AccessApprovalFlow flow, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
