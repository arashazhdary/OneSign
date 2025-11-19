using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IPasswordResetTokenRepository
{
    Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<PasswordResetToken> AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
    Task UpdateAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
}

