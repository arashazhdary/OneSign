using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Repositories;

public interface IKeySetRepository
{
    Task<KeySet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KeySet>> GetByScopeAsync(KeyScopeType scopeType, string scopeId, CancellationToken cancellationToken = default);
    Task<KeySet?> GetDefaultForScopeAsync(KeyScopeType scopeType, string scopeId, KeyPurpose purpose, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KeySet>> GetByPurposeAsync(KeyPurpose purpose, CancellationToken cancellationToken = default);
    Task AddAsync(KeySet keySet, CancellationToken cancellationToken = default);
    Task UpdateAsync(KeySet keySet, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
