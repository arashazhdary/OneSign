using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Repositories;

public interface IPolicyAssignmentRepository
{
    Task<List<PolicyAssignment>> GetByTargetAsync(Guid tenantId, string targetKey, PolicyTargetType targetType, CancellationToken cancellationToken = default);
    Task<List<PolicyAssignment>> GetByPolicyIdAsync(Guid policyId, CancellationToken cancellationToken = default);
    Task<PolicyAssignment> AddAsync(PolicyAssignment assignment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateOrderAsync(List<PolicyAssignment> assignments, CancellationToken cancellationToken = default);
}
