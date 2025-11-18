using MediatR;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetDeploymentDescriptorQuery : IRequest<Result<DeploymentDescriptor>>
{
    public Guid EnvironmentId { get; set; }
}

public class GetDeploymentDescriptorQueryHandler : IRequestHandler<GetDeploymentDescriptorQuery, Result<DeploymentDescriptor>>
{
    private readonly IDeploymentEnvironmentRepository _environmentRepository;

    public GetDeploymentDescriptorQueryHandler(IDeploymentEnvironmentRepository environmentRepository)
    {
        _environmentRepository = environmentRepository;
    }

    public async Task<Result<DeploymentDescriptor>> Handle(GetDeploymentDescriptorQuery request, CancellationToken cancellationToken)
    {
        var environment = await _environmentRepository.GetByIdAsync(request.EnvironmentId, cancellationToken);

        if (environment == null)
        {
            return Result.Failure<DeploymentDescriptor>("EnvironmentNotFound", $"Environment {request.EnvironmentId} not found");
        }

        var descriptor = new DeploymentDescriptor
        {
            EnvironmentId = environment.Id,
            Version = "1.0.0",
            Services = new Dictionary<string, string>
            {
                ["api"] = "onesign-api:latest",
                ["worker"] = "onesign-worker:latest",
                ["admin-portal"] = "onesign-admin:latest"
            },
            Configuration = new Dictionary<string, string>
            {
                ["DatabaseProvider"] = "PostgreSQL",
                ["CacheProvider"] = "Redis",
                ["LogLevel"] = "Information"
            },
            GeneratedAt = DateTime.UtcNow
        };

        return Result.Success(descriptor);
    }
}
