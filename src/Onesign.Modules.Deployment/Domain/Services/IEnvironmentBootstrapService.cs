using Onesign.Modules.Deployment.Domain.Entities;

namespace Onesign.Modules.Deployment.Domain.Services;

public interface IEnvironmentBootstrapService
{
    Task BootstrapAsync(DeploymentDescriptor descriptor, CancellationToken cancellationToken = default);
}
