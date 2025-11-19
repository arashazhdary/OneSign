using MediatR;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Commands;

public class FailoverRegionCommand : IRequest<Result<FailoverResult>>
{
    public string SourceRegionId { get; set; } = string.Empty;
    public string TargetRegionId { get; set; } = string.Empty;
    public FailoverType FailoverType { get; set; } = FailoverType.Planned;
    public string? Reason { get; set; }
    public List<Guid>? TenantIds { get; set; }
}

public class FailoverRegionCommandHandler : IRequestHandler<FailoverRegionCommand, Result<FailoverResult>>
{
    private readonly IFailoverService _failoverService;

    public FailoverRegionCommandHandler(IFailoverService failoverService)
    {
        _failoverService = failoverService;
    }

    public async Task<Result<FailoverResult>> Handle(FailoverRegionCommand request, CancellationToken cancellationToken)
    {
        var failoverRequest = new FailoverRequest
        {
            SourceRegionId = request.SourceRegionId,
            TargetRegionId = request.TargetRegionId,
            FailoverType = request.FailoverType,
            Reason = request.Reason,
            TenantIds = request.TenantIds
        };

        var result = await _failoverService.InitiateFailoverAsync(failoverRequest, cancellationToken);

        if (result.FailoverId == Guid.Empty)
        {
            return Result.Failure<FailoverResult>("FailoverFailed", result.ErrorMessage);
        }

        return Result.Success(result);
    }
}
