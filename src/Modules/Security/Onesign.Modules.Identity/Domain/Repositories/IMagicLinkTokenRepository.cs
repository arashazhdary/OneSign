using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IMagicLinkTokenRepository
{
    Task<MagicLinkToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<MagicLinkToken> AddAsync(MagicLinkToken token, CancellationToken cancellationToken = default);
    Task UpdateAsync(MagicLinkToken token, CancellationToken cancellationToken = default);
}
