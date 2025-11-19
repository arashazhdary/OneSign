using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class CreateWebhookCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public List<string> EventTypes { get; set; } = new();
}
