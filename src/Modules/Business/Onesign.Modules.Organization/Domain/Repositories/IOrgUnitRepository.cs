using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Domain.Repositories;

public interface IOrgUnitRepository
{
    Task<OrgUnit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrgUnit?> GetRootByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<OrgUnit>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<OrgUnit>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default);
    Task<List<OrgUnit>> GetDescendantsAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<OrgUnit> AddAsync(OrgUnit orgUnit, CancellationToken cancellationToken = default);
    Task UpdateAsync(OrgUnit orgUnit, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasChildrenAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<int> GetMaxSortOrderForParentAsync(Guid? parentId, Guid tenantId, CancellationToken cancellationToken = default);
}

