using Onesign.Modules.Federation.Domain.Entities;

namespace Onesign.Modules.Federation.Domain.Repositories;

public interface IOidcFederationProviderRepository
{
    Task<OidcFederationProvider?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<OidcFederationProvider>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<OidcFederationProvider> AddAsync(OidcFederationProvider provider, CancellationToken cancellationToken = default);
    Task UpdateAsync(OidcFederationProvider provider, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
