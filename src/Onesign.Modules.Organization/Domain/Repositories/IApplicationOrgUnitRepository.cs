using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Domain.Repositories;

public interface IApplicationOrgUnitRepository
{
    Task<List<ApplicationOrgUnit>> GetByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default);
    Task<List<ApplicationOrgUnit>> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<List<ApplicationOrgUnit>> GetByOrgUnitAndDescendantsAsync(Guid orgUnitId, List<Guid> descendantIds, CancellationToken cancellationToken = default);
    Task AddAsync(ApplicationOrgUnit applicationOrgUnit, CancellationToken cancellationToken = default);
    Task AddRangeAsync(List<ApplicationOrgUnit> applicationOrgUnits, CancellationToken cancellationToken = default);
    Task DeleteByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid applicationClientId, Guid orgUnitId, CancellationToken cancellationToken = default);
}

