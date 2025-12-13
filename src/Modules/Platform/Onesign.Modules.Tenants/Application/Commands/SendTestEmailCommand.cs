using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class SendTestEmailCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
