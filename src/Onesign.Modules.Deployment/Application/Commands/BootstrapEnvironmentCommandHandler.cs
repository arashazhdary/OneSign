using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class BootstrapEnvironmentCommandHandler : IRequestHandler<BootstrapEnvironmentCommand, Result<string>>
{
    private readonly IEnvironmentBootstrapService _bootstrapService;
    private readonly ILogger<BootstrapEnvironmentCommandHandler> _logger;

    public BootstrapEnvironmentCommandHandler(
        IEnvironmentBootstrapService bootstrapService,
        ILogger<BootstrapEnvironmentCommandHandler> logger)
    {
        _bootstrapService = bootstrapService;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(BootstrapEnvironmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bootstrapping environment: {EnvironmentId}, Name: {Name}", request.EnvironmentId, request.Name);

        try
        {
            var descriptor = new DeploymentDescriptor
            {
                EnvironmentId = request.EnvironmentId,
                Name = request.Name,
                Type = request.Type,
                RegionId = request.RegionId,
                BaseUrl = request.BaseUrl,
                LicenseKey = request.LicenseKey,
                DatabaseConnectionString = request.DatabaseConnectionString,
                StorageEndpoint = request.StorageEndpoint,
                SmtpHost = request.SmtpHost,
                SmtpPort = request.SmtpPort,
                ObservabilityEndpoint = request.ObservabilityEndpoint,
                FeaturesJson = request.FeaturesJson
            };

            await _bootstrapService.BootstrapAsync(descriptor, cancellationToken);

            _logger.LogInformation("Environment bootstrapped successfully: {EnvironmentId}", request.EnvironmentId);

            return Result.Success(request.EnvironmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bootstrap environment: {EnvironmentId}", request.EnvironmentId);
            return Result.Failure<string>("BOOTSTRAP_FAILED", ex.Message);
        }
    }
}
