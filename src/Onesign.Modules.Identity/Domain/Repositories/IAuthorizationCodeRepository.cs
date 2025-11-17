using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IAuthorizationCodeRepository
{
    Task<AuthorizationCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<AuthorizationCode> AddAsync(AuthorizationCode authorizationCode, CancellationToken cancellationToken = default);
    Task UpdateAsync(AuthorizationCode authorizationCode, CancellationToken cancellationToken = default);
    Task DeleteExpiredCodesAsync(CancellationToken cancellationToken = default);
}

