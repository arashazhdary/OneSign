using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentsQueryHandler : IRequestHandler<GetEnvironmentsQuery, Result<List<EnvironmentSummaryDto>>>
{
    private readonly ILogger<GetEnvironmentsQueryHandler> _logger;

    public GetEnvironmentsQueryHandler(ILogger<GetEnvironmentsQueryHandler> logger)
    {
        _logger = logger;
    }

    public async Task<Result<List<EnvironmentSummaryDto>>> Handle(GetEnvironmentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving environments with filters - Type: {Type}, RegionId: {RegionId}",
            request.FilterByType, request.FilterByRegionId);

        // TODO: Implement repository to retrieve environments
        // var environments = await _environmentRepository.GetAllAsync(cancellationToken);
        //
        // if (request.FilterByType.HasValue)
        //     environments = environments.Where(e => e.Type == request.FilterByType.Value).ToList();
        //
        // if (!string.IsNullOrEmpty(request.FilterByRegionId))
        //     environments = environments.Where(e => e.RegionId == request.FilterByRegionId).ToList();

        var result = new List<EnvironmentSummaryDto>();

        await Task.CompletedTask;

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
