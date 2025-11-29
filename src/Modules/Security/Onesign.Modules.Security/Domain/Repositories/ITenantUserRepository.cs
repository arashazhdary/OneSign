using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface ITenantUserRepository
{
    Task<TenantUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
