using Onesign.Modules.Deployment.Domain.Entities;

namespace Onesign.Modules.Deployment.Domain.Repositories;

public interface IEnvironmentFeatureConfigRepository
{
    Task<EnvironmentFeatureConfig?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<EnvironmentFeatureConfig?> GetByEnvironmentIdAsync(string environmentId, CancellationToken cancellationToken = default);
    Task AddAsync(EnvironmentFeatureConfig config, CancellationToken cancellationToken = default);
    Task UpdateAsync(EnvironmentFeatureConfig config, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
