using MediatR;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class InitializeEnvironmentCommand : IRequest<Result<InitializationResult>>
{
    public string EnvironmentName { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
    public string? LicenseKey { get; set; }
    public Dictionary<string, string>? Configuration { get; set; }
    public bool ApplyMigrations { get; set; } = true;
    public bool SeedData { get; set; } = true;
}

public class InitializeEnvironmentCommandHandler : IRequestHandler<InitializeEnvironmentCommand, Result<InitializationResult>>
{
    private readonly IDeploymentInitializer _deploymentInitializer;

    public InitializeEnvironmentCommandHandler(IDeploymentInitializer deploymentInitializer)
    {
        _deploymentInitializer = deploymentInitializer;
    }

    public async Task<Result<InitializationResult>> Handle(InitializeEnvironmentCommand request, CancellationToken cancellationToken)
    {
        var initRequest = new InitializationRequest
        {
            EnvironmentName = request.EnvironmentName,
            AdminEmail = request.AdminEmail,
            AdminPassword = request.AdminPassword,
            LicenseKey = request.LicenseKey,
            Configuration = request.Configuration,
            ApplyMigrations = request.ApplyMigrations,
            SeedData = request.SeedData
        };

        var result = await _deploymentInitializer.InitializeEnvironmentAsync(initRequest, cancellationToken);

        if (!result.Success)
        {
            return Result.Failure<InitializationResult>("InitializationFailed", result.ErrorMessage);
        }

        return Result.Success(result);
    }
}
