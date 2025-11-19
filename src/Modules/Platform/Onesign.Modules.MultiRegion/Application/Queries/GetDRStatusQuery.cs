using MediatR;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetDRStatusQuery : IRequest<Result<DRStatusResponse>>
{
    public string? RegionId { get; set; }
}

public class DRStatusResponse
{
    public List<RegionDRStatus> Regions { get; set; } = new();
    public bool AllRegionsHealthy { get; set; }
    public int ActiveFailovers { get; set; }
    public DateTime LastHealthCheck { get; set; }
    public DRReadiness OverallReadiness { get; set; } = new();
}

public class RegionDRStatus
{
    public string RegionId { get; set; } = string.Empty;
    public string RegionName { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public bool IsFailoverTarget { get; set; }
    public int TenantsCount { get; set; }
    public DateTime? LastBackupAt { get; set; }
    public DateTime LastHealthCheckAt { get; set; }
}

public class DRReadiness
{
    public string Level { get; set; } = "Good";
    public List<string> Warnings { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class GetDRStatusQueryHandler : IRequestHandler<GetDRStatusQuery, Result<DRStatusResponse>>
{
    private readonly IRegionHealthMonitor _healthMonitor;
    private readonly IFailoverService _failoverService;

    public GetDRStatusQueryHandler(
        IRegionHealthMonitor healthMonitor,
        IFailoverService failoverService)
    {
        _healthMonitor = healthMonitor;
        _failoverService = failoverService;
    }

    public async Task<Result<DRStatusResponse>> Handle(GetDRStatusQuery request, CancellationToken cancellationToken)
    {
        var healthStatuses = await _healthMonitor.CheckAllRegionsHealthAsync(cancellationToken);

        var regionStatuses = healthStatuses.Select(h => new RegionDRStatus
        {
            RegionId = h.RegionId,
            RegionName = h.RegionName,
            IsHealthy = h.IsHealthy,
            IsFailoverTarget = false,
            TenantsCount = 0,
            LastHealthCheckAt = h.CheckedAt
        }).ToList();

        var allHealthy = regionStatuses.All(r => r.IsHealthy);

        var readiness = new DRReadiness
        {
            Level = allHealthy ? "Good" : "Warning",
            Warnings = allHealthy ? new List<string>() : new List<string> { "Some regions are unhealthy" },
            Recommendations = new List<string>
            {
                "Review backup schedules",
                "Test DR procedures quarterly"
            }
        };

        var response = new DRStatusResponse
        {
            Regions = regionStatuses,
            AllRegionsHealthy = allHealthy,
            ActiveFailovers = 0,
            LastHealthCheck = DateTime.UtcNow,
            OverallReadiness = readiness
        };

        return Result.Success(response);
    }
}
