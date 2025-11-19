using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface IOrgUnitMfaRuleRepository
{
    Task<List<OrgUnitMfaRule>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<OrgUnitMfaRule?> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task AddAsync(OrgUnitMfaRule rule, CancellationToken cancellationToken = default);
    Task AddRangeAsync(List<OrgUnitMfaRule> rules, CancellationToken cancellationToken = default);
    Task UpdateAsync(OrgUnitMfaRule rule, CancellationToken cancellationToken = default);
    Task DeleteByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
