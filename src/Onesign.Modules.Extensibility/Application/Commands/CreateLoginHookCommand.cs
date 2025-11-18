using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class CreateLoginHookCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty; // PreLogin, PostLogin, etc.
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 2;
    public bool FailOpen { get; set; } = true;
}
