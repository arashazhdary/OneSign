using Onesign.Modules.Developer.Domain.Entities;

namespace Onesign.Modules.Developer.Domain.Repositories;

public interface IServiceAccountRepository
{
    Task<ServiceAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceAccount?> GetByEmailAsync(Guid tenantId, string email, CancellationToken cancellationToken = default);
    Task<List<ServiceAccount>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<ServiceAccount> AddAsync(ServiceAccount serviceAccount, CancellationToken cancellationToken = default);
    Task UpdateAsync(ServiceAccount serviceAccount, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateLastAccessAsync(Guid id, DateTime lastAccessAt, CancellationToken cancellationToken = default);
}
