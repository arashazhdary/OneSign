using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface ITenantUserRepository
{
    Task<TenantUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TenantUser?> GetByGlobalUserIdAndTenantIdAsync(Guid globalUserId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantUser>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantUser> AddAsync(TenantUser user, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantUser user, CancellationToken cancellationToken = default);
}

