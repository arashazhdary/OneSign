using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Repositories;

/// <summary>
/// Simple in-memory implementation of workflow definition repository.
/// This avoids adding new database schema while enabling workflow engine
/// and handlers to function without DI errors.
/// </summary>
public class WorkflowDefinitionRepository : IWorkflowDefinitionRepository
{
    private static readonly List<WorkflowDefinition> _workflows = new();
    private static readonly object _syncRoot = new();

    public Task<WorkflowDefinition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<WorkflowDefinition?>(_workflows.FirstOrDefault(w => w.Id == id));
        }
    }

    public Task<WorkflowDefinition?> GetByTargetAsync(Guid tenantId, AccessType targetType, Guid? targetId, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<WorkflowDefinition?>(_workflows.FirstOrDefault(w =>
                w.TenantId == tenantId &&
                w.TargetType == targetType &&
                w.TargetId == targetId));
        }
    }

    public Task<IReadOnlyList<WorkflowDefinition>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            var result = _workflows.Where(w => w.TenantId == tenantId).ToList();
            return Task.FromResult<IReadOnlyList<WorkflowDefinition>>(result);
        }
    }

    public Task AddAsync(WorkflowDefinition workflow, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            if (workflow.Id == Guid.Empty)
            {
                workflow.Id = Guid.NewGuid();
            }
            _workflows.Add(workflow);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(WorkflowDefinition workflow, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            var existing = _workflows.FirstOrDefault(w => w.Id == workflow.Id);
            if (existing != null)
            {
                _workflows.Remove(existing);
                _workflows.Add(workflow);
            }
            return Task.CompletedTask;
        }
    }
}
