using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IPasskeyCredentialRepository
{
    Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PasskeyCredential>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<PasskeyCredential> AddAsync(PasskeyCredential credential, CancellationToken cancellationToken = default);
    Task UpdateAsync(PasskeyCredential credential, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
