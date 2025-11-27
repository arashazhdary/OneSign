using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentsQueryHandler : IRequestHandler<GetEnvironmentsQuery, Result<List<EnvironmentSummaryDto>>>
{
    private readonly ILogger<GetEnvironmentsQueryHandler> _logger;
    private readonly IDeploymentEnvironmentRepository _environmentRepository;

    public GetEnvironmentsQueryHandler(
        ILogger<GetEnvironmentsQueryHandler> logger,
        IDeploymentEnvironmentRepository environmentRepository)
    {
        _logger = logger;
        _environmentRepository = environmentRepository;
    }

    public async Task<Result<List<EnvironmentSummaryDto>>> Handle(GetEnvironmentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving environments with filters - Type: {Type}, RegionId: {RegionId}",
            request.FilterByType, request.FilterByRegionId);

        var environments = await _environmentRepository.GetAllAsync(cancellationToken);

        if (request.FilterByType.HasValue)
            environments = environments.Where(e => e.Type == request.FilterByType.Value).ToList();

        if (!string.IsNullOrEmpty(request.FilterByRegionId))
            environments = environments.Where(e => e.RegionId == request.FilterByRegionId).ToList();

        var result = environments.Select(e => new EnvironmentSummaryDto
        {
            Id = e.Id,
            Name = e.Name,
            Type = e.Type,
            RegionId = e.RegionId,
            BaseUrl = e.BaseUrl,
            AppVersion = e.AppVersion,
            Status = DetermineStatus(e.LastHeartbeatAt),
            CreatedAt = e.CreatedAt,
            LastHeartbeatAt = e.LastHeartbeatAt
        }).ToList();

        return Result.Success(result);
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
}
