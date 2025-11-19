using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Domain.Repositories;

public interface ISdkConfigurationRepository
{
    Task<SdkConfiguration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SdkConfiguration?> GetByTenantAndTypeAsync(Guid tenantId, SdkType sdkType, CancellationToken cancellationToken = default);
    Task<List<SdkConfiguration>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<SdkConfiguration> AddAsync(SdkConfiguration config, CancellationToken cancellationToken = default);
    Task UpdateAsync(SdkConfiguration config, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
