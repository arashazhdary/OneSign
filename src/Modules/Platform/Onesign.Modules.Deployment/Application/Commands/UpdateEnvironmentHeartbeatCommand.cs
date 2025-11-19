using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class UpdateEnvironmentHeartbeatCommand : IRequest<Result>
{
    public string EnvironmentId { get; set; } = string.Empty;
    public string? AppVersion { get; set; }
    public string? DbSchemaVersion { get; set; }
}
