using MediatR;
using Onesign.Shared.Abstractions;

namespace Onesign.Modules.Identity.Application.Commands;

public class RevokeSessionCommand : IRequest<Result>
{
    public Guid SessionId { get; set; }
    public Guid TenantUserId { get; set; }
}
