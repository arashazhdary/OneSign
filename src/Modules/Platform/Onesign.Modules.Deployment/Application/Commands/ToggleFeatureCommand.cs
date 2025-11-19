using MediatR;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class ToggleFeatureCommand : IRequest<Result<bool>>
{
    public string FeatureKey { get; set; } = string.Empty;
    public bool Enabled { get; set; }
}

public class ToggleFeatureCommandHandler : IRequestHandler<ToggleFeatureCommand, Result<bool>>
{
    private readonly IFeatureGateService _featureGateService;

    public ToggleFeatureCommandHandler(IFeatureGateService featureGateService)
    {
        _featureGateService = featureGateService;
    }

    public async Task<Result<bool>> Handle(ToggleFeatureCommand request, CancellationToken cancellationToken)
    {
        var success = await _featureGateService.ToggleFeatureAsync(request.FeatureKey, request.Enabled, cancellationToken);

        if (!success)
        {
            return Result.Failure<bool>("FeatureNotFound", $"Feature '{request.FeatureKey}' not found");
        }

        return Result.Success(true);
    }
}
