using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Domain.Services;

public interface IOrgTreeService
{
    Task<OrgUnit> CreateChildAsync(Guid tenantId, Guid? parentId, string name, string? code, int? sortOrder, CancellationToken cancellationToken = default);
    Task<OrgUnit> UpdateOrgUnitAsync(Guid orgUnitId, string name, string? code, int? sortOrder, Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus status, CancellationToken cancellationToken = default);
    Task MoveOrgUnitAsync(Guid orgUnitId, Guid? newParentId, CancellationToken cancellationToken = default);
    Task DeleteOrgUnitAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrgUnit>> GetTreeForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<string> GeneratePathAsync(Guid? parentId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<int> CalculateLevelAsync(Guid? parentId, CancellationToken cancellationToken = default);
}

