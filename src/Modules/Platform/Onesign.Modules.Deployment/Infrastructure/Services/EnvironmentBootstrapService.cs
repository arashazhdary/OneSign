using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Modules.Deployment.Domain.Services;

namespace Onesign.Modules.Deployment.Infrastructure.Services;

public class EnvironmentBootstrapService : IEnvironmentBootstrapService
{
    private readonly IDeploymentEnvironmentRepository _environmentRepository;
    private readonly IEnvironmentFeatureConfigRepository _featureConfigRepository;
    private readonly ILogger<EnvironmentBootstrapService> _logger;

    public EnvironmentBootstrapService(
        IDeploymentEnvironmentRepository environmentRepository,
        IEnvironmentFeatureConfigRepository featureConfigRepository,
        ILogger<EnvironmentBootstrapService> logger)
    {
        _environmentRepository = environmentRepository;
        _featureConfigRepository = featureConfigRepository;
        _logger = logger;
    }

    public async Task BootstrapAsync(DeploymentDescriptor descriptor, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting environment bootstrap for {EnvironmentId} ({Name})",
            descriptor.EnvironmentId, descriptor.Name);

        // Create deployment environment record
        var environment = new DeploymentEnvironment
        {
            Id = Guid.NewGuid(),
            EnvironmentId = descriptor.EnvironmentId,
            Name = descriptor.Name,
            Type = descriptor.Type,
            RegionId = descriptor.RegionId,
            Status = EnvironmentStatus.Provisioning,
            BaseUrl = descriptor.BaseUrl,
            DatabaseConnectionString = descriptor.DatabaseConnectionString,
            CreatedAt = DateTime.UtcNow,
            Version = descriptor.Version
        };

        await _environmentRepository.AddAsync(environment, cancellationToken);

        _logger.LogInformation(
            "Environment {EnvironmentId} created with ID {Id}",
            descriptor.EnvironmentId, environment.Id);

        // Create feature configuration
        var featureConfig = new EnvironmentFeatureConfig
        {
            Id = Guid.NewGuid(),
            EnvironmentId = environment.Id,
            FeaturesJson = descriptor.FeaturesJson,
            UpdatedAt = DateTime.UtcNow
        };

        await _featureConfigRepository.AddAsync(featureConfig, cancellationToken);

        // Update environment status to active
        environment.Status = EnvironmentStatus.Active;
        environment.UpdatedAt = DateTime.UtcNow;
        await _environmentRepository.UpdateAsync(environment, cancellationToken);

        _logger.LogInformation(
            "Environment bootstrap completed for {EnvironmentId}",
            descriptor.EnvironmentId);
    }
}
