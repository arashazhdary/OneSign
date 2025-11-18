using Onesign.Modules.Federation.Domain.Entities;

namespace Onesign.Modules.Federation.Domain.Repositories;

public interface IScimTokenRepository
{
    Task<ScimToken?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ScimToken>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<ScimToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<ScimToken> AddAsync(ScimToken token, CancellationToken cancellationToken = default);
    Task UpdateAsync(ScimToken token, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
