using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface IMfaChallengeRepository
{
    Task<MfaChallenge?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(MfaChallenge mfaChallenge, CancellationToken cancellationToken = default);
    Task UpdateAsync(MfaChallenge mfaChallenge, CancellationToken cancellationToken = default);
    Task DeleteExpiredAsync(DateTime cutoffTime, CancellationToken cancellationToken = default);
}
