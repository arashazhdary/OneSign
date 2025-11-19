using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IExternalLoginRepository
{
    Task<ExternalLogin?> GetByProviderAndProviderUserIdAsync(string provider, string providerUserId, CancellationToken cancellationToken = default);
    Task<ExternalLogin> AddAsync(ExternalLogin externalLogin, CancellationToken cancellationToken = default);
}

