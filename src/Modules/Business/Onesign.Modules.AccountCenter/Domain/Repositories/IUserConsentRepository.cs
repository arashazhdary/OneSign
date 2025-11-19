using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Enums;

namespace Onesign.Modules.AccountCenter.Domain.Repositories;

public interface IUserConsentRepository
{
    Task<List<UserConsent>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserConsent?> GetByUserAndTypeAsync(Guid userId, ConsentType type, CancellationToken cancellationToken = default);
    Task<UserConsent> AddAsync(UserConsent consent, CancellationToken cancellationToken = default);
    Task UpdateAsync(UserConsent consent, CancellationToken cancellationToken = default);
}
