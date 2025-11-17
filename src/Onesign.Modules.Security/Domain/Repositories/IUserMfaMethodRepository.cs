using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface IUserMfaMethodRepository
{
    Task<UserMfaMethod?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<UserMfaMethod>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<UserMfaMethod?> GetPrimaryByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task AddAsync(UserMfaMethod userMfaMethod, CancellationToken cancellationToken = default);
    Task UpdateAsync(UserMfaMethod userMfaMethod, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
