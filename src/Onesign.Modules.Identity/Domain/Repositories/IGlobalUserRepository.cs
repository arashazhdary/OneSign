using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IGlobalUserRepository
{
    Task<GlobalUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<GlobalUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<GlobalUser> AddAsync(GlobalUser user, CancellationToken cancellationToken = default);
    Task UpdateAsync(GlobalUser user, CancellationToken cancellationToken = default);
}

