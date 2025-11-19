using Onesign.Modules.Applications.Domain.Entities;

namespace Onesign.Modules.Applications.Domain.Repositories;

public interface IApplicationClientRepository
{
    Task<ApplicationClient?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApplicationClient?> GetByClientIdAsync(string clientId, CancellationToken cancellationToken = default);
    Task<List<ApplicationClient>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<ApplicationClient> AddAsync(ApplicationClient client, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApplicationClient client, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

