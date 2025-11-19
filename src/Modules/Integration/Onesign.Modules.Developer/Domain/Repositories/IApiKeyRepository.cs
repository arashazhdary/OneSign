using Onesign.Modules.Developer.Domain.Entities;

namespace Onesign.Modules.Developer.Domain.Repositories;

public interface IApiKeyRepository
{
    Task<ApiKey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiKey?> GetByKeyHashAsync(string keyHash, CancellationToken cancellationToken = default);
    Task<List<ApiKey>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<ApiKey>> GetByServiceAccountIdAsync(Guid serviceAccountId, CancellationToken cancellationToken = default);
    Task<ApiKey> AddAsync(ApiKey apiKey, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApiKey apiKey, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateLastUsedAsync(Guid id, DateTime lastUsedAt, CancellationToken cancellationToken = default);
}
