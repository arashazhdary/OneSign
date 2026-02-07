using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RevokeSessionCommand : IRequest<Result>
{
    public Guid SessionId { get; set; }
    public Guid TenantUserId { get; set; }
}
