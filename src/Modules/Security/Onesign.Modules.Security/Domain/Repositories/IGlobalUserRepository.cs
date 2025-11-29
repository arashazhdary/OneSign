using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface IGlobalUserRepository
{
    Task<GlobalUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
