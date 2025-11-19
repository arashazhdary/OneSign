using Onesign.Modules.Federation.Domain.Entities;

namespace Onesign.Modules.Federation.Domain.Repositories;

public interface ISamlProviderRepository
{
    Task<SamlProvider?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<SamlProvider>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<SamlProvider?> GetByEntityIdAsync(Guid tenantId, string entityId, CancellationToken cancellationToken = default);
    Task<SamlProvider> AddAsync(SamlProvider provider, CancellationToken cancellationToken = default);
    Task UpdateAsync(SamlProvider provider, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
