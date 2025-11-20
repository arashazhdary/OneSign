using MediatR;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class UpdateDeploymentDescriptorCommand : IRequest<Result<DeploymentDescriptor>>
{
    public Guid EnvironmentId { get; set; }
    public string? Version { get; set; }
    public Dictionary<string, string>? Services { get; set; }
    public Dictionary<string, string>? Configuration { get; set; }
}

public class UpdateDeploymentDescriptorCommandHandler : IRequestHandler<UpdateDeploymentDescriptorCommand, Result<DeploymentDescriptor>>
{
    private readonly IDeploymentEnvironmentRepository _environmentRepository;

    public UpdateDeploymentDescriptorCommandHandler(IDeploymentEnvironmentRepository environmentRepository)
    {
        _environmentRepository = environmentRepository;
    }

    public async Task<Result<DeploymentDescriptor>> Handle(UpdateDeploymentDescriptorCommand request, CancellationToken cancellationToken)
    {
        var environment = await _environmentRepository.GetByIdAsync(request.EnvironmentId.ToString(), cancellationToken);

        if (environment == null)
        {
            return Result.Failure<DeploymentDescriptor>("EnvironmentNotFound", $"Environment {request.EnvironmentId} not found");
        }

        var descriptor = new DeploymentDescriptor
        {
            EnvironmentId = request.EnvironmentId.ToString(),
            Version = request.Version ?? "1.0.0",
            Services = request.Services ?? new Dictionary<string, string>(),
            Configuration = request.Configuration ?? new Dictionary<string, string>(),
            GeneratedAt = DateTime.UtcNow
        };

        return Result.Success(descriptor);
    }
}
