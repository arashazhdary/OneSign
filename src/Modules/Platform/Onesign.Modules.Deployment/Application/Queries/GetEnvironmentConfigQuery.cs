using MediatR;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentConfigQuery : IRequest<Result<EnvironmentInfo>>
{
}

public class GetEnvironmentConfigQueryHandler : IRequestHandler<GetEnvironmentConfigQuery, Result<EnvironmentInfo>>
{
    private readonly IDeploymentInitializer _deploymentInitializer;

    public GetEnvironmentConfigQueryHandler(IDeploymentInitializer deploymentInitializer)
    {
        _deploymentInitializer = deploymentInitializer;
    }

    public async Task<Result<EnvironmentInfo>> Handle(GetEnvironmentConfigQuery request, CancellationToken cancellationToken)
    {
        var environmentInfo = await _deploymentInitializer.GetEnvironmentInfoAsync(cancellationToken);
        return Result.Success(environmentInfo);
    }
}
