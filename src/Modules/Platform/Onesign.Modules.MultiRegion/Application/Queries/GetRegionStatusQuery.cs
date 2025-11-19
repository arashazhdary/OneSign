using MediatR;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetRegionStatusQuery : IRequest<Result<RegionHealthStatus>>
{
    public string RegionId { get; set; } = string.Empty;
}

public class GetRegionStatusQueryHandler : IRequestHandler<GetRegionStatusQuery, Result<RegionHealthStatus>>
{
    private readonly IRegionHealthMonitor _healthMonitor;

    public GetRegionStatusQueryHandler(IRegionHealthMonitor healthMonitor)
    {
        _healthMonitor = healthMonitor;
    }

    public async Task<Result<RegionHealthStatus>> Handle(GetRegionStatusQuery request, CancellationToken cancellationToken)
    {
        var status = await _healthMonitor.CheckRegionHealthAsync(request.RegionId, cancellationToken);

        if (status.Status == "NotFound")
        {
            return Result.Failure<RegionHealthStatus>("RegionNotFound", status.ErrorMessage);
        }

        return Result.Success(status);
    }
}
