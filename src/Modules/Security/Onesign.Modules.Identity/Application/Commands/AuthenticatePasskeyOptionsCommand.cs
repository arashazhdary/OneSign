using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class AuthenticatePasskeyOptionsCommand : IRequest<Result<object>>
{
    public Guid TenantId { get; set; }
    public string? Email { get; set; }
}
