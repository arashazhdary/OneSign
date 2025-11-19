using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;

namespace Onesign.Modules.AccessRequests.Domain.Repositories;

public interface IWorkflowDefinitionRepository
{
    Task<WorkflowDefinition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WorkflowDefinition?> GetByTargetAsync(Guid tenantId, AccessType targetType, Guid? targetId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WorkflowDefinition>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(WorkflowDefinition workflow, CancellationToken cancellationToken = default);
    Task UpdateAsync(WorkflowDefinition workflow, CancellationToken cancellationToken = default);
}
