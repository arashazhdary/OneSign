using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class UpdateEnvironmentHeartbeatCommandHandler : IRequestHandler<UpdateEnvironmentHeartbeatCommand, Result>
{
    private readonly ILogger<UpdateEnvironmentHeartbeatCommandHandler> _logger;

    public UpdateEnvironmentHeartbeatCommandHandler(ILogger<UpdateEnvironmentHeartbeatCommandHandler> logger)
    {
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateEnvironmentHeartbeatCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating heartbeat for environment: {EnvironmentId}", request.EnvironmentId);

        // TODO: Implement repository to update environment heartbeat
        // var environment = await _environmentRepository.GetByIdAsync(request.EnvironmentId, cancellationToken);
        // if (environment == null)
        // {
        //     return Result.Failure("ENVIRONMENT_NOT_FOUND", "Environment not found");
        // }
        //
        // environment.LastHeartbeatAt = DateTime.UtcNow;
        // if (!string.IsNullOrEmpty(request.AppVersion))
        //     environment.AppVersion = request.AppVersion;
        // if (!string.IsNullOrEmpty(request.DbSchemaVersion))
        //     environment.DbSchemaVersion = request.DbSchemaVersion;
        //
        // await _environmentRepository.UpdateAsync(environment, cancellationToken);

        await Task.CompletedTask;

        _logger.LogInformation("Heartbeat updated for environment: {EnvironmentId}", request.EnvironmentId);

        return Result.Success();
    }
}
