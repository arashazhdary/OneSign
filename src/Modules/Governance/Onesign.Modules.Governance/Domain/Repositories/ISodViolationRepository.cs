using Onesign.Modules.Governance.Domain.Entities;

namespace Onesign.Modules.Governance.Domain.Repositories;

public interface ISodViolationRepository
{
    Task<List<SodViolation>> GetByTenantIdAsync(Guid tenantId, bool? resolved, CancellationToken cancellationToken = default);
    Task<SodViolation> AddAsync(SodViolation violation, CancellationToken cancellationToken = default);
    Task UpdateAsync(SodViolation violation, CancellationToken cancellationToken = default);
}
