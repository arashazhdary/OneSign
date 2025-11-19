using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Repositories;

public interface IKeyRotationPolicyRepository
{
    Task<KeyRotationPolicy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<KeyRotationPolicy?> GetByScopeAndPurposeAsync(KeyScopeType scopeType, string scopeId, KeyPurpose purpose, CancellationToken cancellationToken = default);
    Task<KeyRotationPolicy?> GetByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default);
    Task<IEnumerable<KeyRotationPolicy>> GetEnabledAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<KeyRotationPolicy>> GetEnabledPoliciesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<KeyRotationPolicy>> GetByScopeAsync(KeyScopeType scopeType, string scopeId, CancellationToken cancellationToken = default);
    Task AddAsync(KeyRotationPolicy policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(KeyRotationPolicy policy, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
