using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Repositories;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Repositories;

/// <summary>
/// Simple in-memory implementation of access approval flow repository.
/// This avoids adding new database schema while enabling workflow engine
/// and handlers to function without DI errors.
/// </summary>
public class AccessApprovalFlowRepository : IAccessApprovalFlowRepository
{
    private static readonly List<AccessApprovalFlow> _flows = new();
    private static readonly object _syncRoot = new();

    public Task<AccessApprovalFlow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<AccessApprovalFlow?>(_flows.FirstOrDefault(f => f.Id == id));
        }
    }

    public Task<IReadOnlyList<AccessApprovalFlow>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            var result = _flows.Where(f => f.TenantId == tenantId).ToList();
            return Task.FromResult<IReadOnlyList<AccessApprovalFlow>>(result);
        }
    }

    public Task<AccessApprovalFlow?> GetByAccessTypeAsync(Guid tenantId, string accessType, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            return Task.FromResult<AccessApprovalFlow?>(_flows.FirstOrDefault(f =>
                f.TenantId == tenantId &&
                !string.IsNullOrEmpty(f.AccessType) &&
                string.Equals(f.AccessType, accessType, StringComparison.OrdinalIgnoreCase)));
        }
    }

    public Task AddAsync(AccessApprovalFlow flow, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            if (flow.Id == Guid.Empty)
            {
                flow.Id = Guid.NewGuid();
            }

            if (flow.CreatedAt == default)
            {
                flow.CreatedAt = DateTime.UtcNow;
            }

            _flows.Add(flow);
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(AccessApprovalFlow flow, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            var existing = _flows.FirstOrDefault(f => f.Id == flow.Id);
            if (existing != null)
            {
                existing.Name = flow.Name;
                existing.Description = flow.Description;
                existing.AccessType = flow.AccessType;
                existing.TargetApplication = flow.TargetApplication;
                existing.StepsJson = flow.StepsJson;
                existing.RequireAllApprovals = flow.RequireAllApprovals;
                existing.IsEnabled = flow.IsEnabled;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        lock (_syncRoot)
        {
            _flows.RemoveAll(f => f.Id == id);
        }

        return Task.CompletedTask;
    }
}


