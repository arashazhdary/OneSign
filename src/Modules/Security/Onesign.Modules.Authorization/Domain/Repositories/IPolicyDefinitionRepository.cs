using Onesign.Modules.Authorization.Domain.Entities;

namespace Onesign.Modules.Authorization.Domain.Repositories;

public interface IPolicyDefinitionRepository
{
    Task<PolicyDefinition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<PolicyDefinition>> GetByTenantIdAsync(Guid tenantId, bool? enabled = null, CancellationToken cancellationToken = default);
    Task<PolicyDefinition> AddAsync(PolicyDefinition policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(PolicyDefinition policy, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
