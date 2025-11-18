using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Repositories;

public interface IKeyVersionRepository
{
    Task<KeyVersion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<KeyVersion?> GetByKidAsync(string kid, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KeyVersion>> GetByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default);
    Task<KeyVersion?> GetActiveByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KeyVersion>> GetByStateAsync(KeyVersionState state, CancellationToken cancellationToken = default);
    Task AddAsync(KeyVersion keyVersion, CancellationToken cancellationToken = default);
    Task UpdateAsync(KeyVersion keyVersion, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
