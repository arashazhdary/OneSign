using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Enums;

namespace Onesign.Modules.Deployment.Domain.Repositories;

public interface IDeploymentEnvironmentRepository
{
    Task<DeploymentEnvironment?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeploymentEnvironment>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeploymentEnvironment>> GetByTypeAsync(EnvironmentType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeploymentEnvironment>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default);
    Task AddAsync(DeploymentEnvironment environment, CancellationToken cancellationToken = default);
    Task UpdateAsync(DeploymentEnvironment environment, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
