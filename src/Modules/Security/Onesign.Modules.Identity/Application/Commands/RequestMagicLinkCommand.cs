using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RequestMagicLinkCommand : IRequest<Result<string>>
{
    public Guid TenantId { get; set; }
    public string Email { get; set; } = string.Empty;
}
