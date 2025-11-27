using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentByIdQueryHandler : IRequestHandler<GetEnvironmentByIdQuery, Result<EnvironmentDetailDto>>
{
    private readonly ILogger<GetEnvironmentByIdQueryHandler> _logger;
    private readonly IDeploymentEnvironmentRepository _environmentRepository;
    private readonly IEnvironmentFeatureConfigRepository _featureConfigRepository;

    public GetEnvironmentByIdQueryHandler(
        ILogger<GetEnvironmentByIdQueryHandler> logger,
        IDeploymentEnvironmentRepository environmentRepository,
        IEnvironmentFeatureConfigRepository featureConfigRepository)
    {
        _logger = logger;
        _environmentRepository = environmentRepository;
        _featureConfigRepository = featureConfigRepository;
    }

    public async Task<Result<EnvironmentDetailDto>> Handle(GetEnvironmentByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving environment by ID: {EnvironmentId}", request.EnvironmentId);

        var environment = await _environmentRepository.GetByIdAsync(request.EnvironmentId, cancellationToken);
        if (environment == null)
        {
            return Result.Failure<EnvironmentDetailDto>("ENVIRONMENT_NOT_FOUND", "Environment not found");
        }

        var featureConfig = await _featureConfigRepository.GetByEnvironmentIdAsync(request.EnvironmentId, cancellationToken);

        var dto = new EnvironmentDetailDto
        {
            Id = environment.Id,
            Name = environment.Name,
            Type = environment.Type,
            RegionId = environment.RegionId,
            BaseUrl = environment.BaseUrl,
            AppVersion = environment.AppVersion,
            DbSchemaVersion = environment.DbSchemaVersion,
            LicenseKey = environment.LicenseKey,
            Status = DetermineStatus(environment.LastHeartbeatAt),
            CreatedAt = environment.CreatedAt,
            LastHeartbeatAt = environment.LastHeartbeatAt,
            FeatureConfig = featureConfig != null ? new FeatureConfigDto
            {
                MaxTenants = featureConfig.MaxTenants,
                MaxUsers = featureConfig.MaxUsers,
                MaxApplications = featureConfig.MaxApplications,
                EnabledModules = ParseEnabledModules(featureConfig.EnabledModulesJson)
            } : null
        };

        return Result.Success(dto);
    }

    private static EnvironmentStatus DetermineStatus(DateTime? lastHeartbeatAt)
    {
        if (!lastHeartbeatAt.HasValue)
            return EnvironmentStatus.Unknown;

        var timeSinceHeartbeat = DateTime.UtcNow - lastHeartbeatAt.Value;

        if (timeSinceHeartbeat.TotalMinutes <= 5)
            return EnvironmentStatus.Healthy;

        if (timeSinceHeartbeat.TotalMinutes <= 30)
            return EnvironmentStatus.Stale;

        return EnvironmentStatus.Down;
    }

    private static List<string> ParseEnabledModules(string enabledModulesJson)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(enabledModulesJson) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
